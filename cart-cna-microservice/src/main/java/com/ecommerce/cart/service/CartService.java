package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.dto.UserResponse;
import com.ecommerce.cart.exception.ProductValidationException;
import com.ecommerce.cart.exception.UserValidationException;
import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {
    
    private static final Logger LOG = LoggerFactory.getLogger(CartService.class);
    
    private final ReactiveRedisTemplate<String, Cart> redisTemplate;
    private final ReactiveValueOperations<String, Cart> cartOps;
    private final UserValidationService userValidationService;
    private final ProductValidationService productValidationService;
    
    @Autowired
    public CartService(ReactiveRedisTemplate<String, Cart> redisTemplate,
                      UserValidationService userValidationService,
                      ProductValidationService productValidationService) {
        this.redisTemplate = redisTemplate;
        this.cartOps = redisTemplate.opsForValue();
        this.userValidationService = userValidationService;
        this.productValidationService = productValidationService;
    }
    
    /**
     * Check if Redis is available
     */
    private boolean isRedisAvailable() {
        try {
            return redisTemplate != null && 
                   redisTemplate.hasKey("health:check").block(Duration.ofSeconds(1)) != null;
        } catch (Exception e) {
            LOG.warn("Redis is not available: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Fallback cart storage when Redis is unavailable
     */
    private final Map<Integer, Cart> fallbackCartStorage = new ConcurrentHashMap<>();
    
    /**
     * Get user's cart by user ID with user validation
     */
    public Mono<Cart> getCart(Integer userId) {
        if (isRedisAvailable()) {
            String redisKey = "cart:" + userId;
            return cartOps.get(redisKey)
                    .switchIfEmpty(Mono.just(new Cart(userId)))
                    .doOnSuccess(cart -> LOG.debug("Retrieved cart for user {}: {} items", 
                        userId, cart.getItemCount()))
                    .onErrorResume(error -> {
                        LOG.warn("Redis error, using fallback storage: {}", error.getMessage());
                        return Mono.just(fallbackCartStorage.getOrDefault(userId, new Cart(userId)));
                    });
        } else {
            LOG.debug("Using fallback storage for user: {}", userId);
            return Mono.just(fallbackCartStorage.getOrDefault(userId, new Cart(userId)));
        }
    }

    /**
     * Get user's cart with token validation
     * This ensures user can only access their own cart
     */
    public Mono<Cart> getCartWithValidation(String token) {
        return userValidationService.getUserIdFromToken(token)
                .flatMap(this::getCart)
                .doOnSuccess(cart -> LOG.debug("Retrieved validated cart: {} items", 
                    cart.getItemCount()));
    }
    
    /**
     * Save cart to Redis with validation
     */
    public Mono<Boolean> saveCart(Cart cart) {
        if (cart == null || !cart.isValid()) {
            LOG.warn("Attempted to save invalid cart");
            return Mono.just(false);
        }
        
        cart.calculateTotal();
        
        if (isRedisAvailable()) {
            String redisKey = cart.getRedisKey();
            return cartOps.set(redisKey, cart)
                    .doOnSuccess(saved -> LOG.debug("Saved cart for user {}: {} items, total: {}", 
                        cart.getUserId(), cart.getItemCount(), cart.getTotal()))
                    .onErrorResume(error -> {
                        LOG.warn("Redis error, using fallback storage: {}", error.getMessage());
                        fallbackCartStorage.put(cart.getUserId(), cart);
                        return Mono.just(true);
                    });
        } else {
            LOG.debug("Using fallback storage for cart: {}", cart.getUserId());
            fallbackCartStorage.put(cart.getUserId(), cart);
            return Mono.just(true);
        }
    }
    
    /**
     * Add item to cart with full validation
     * Validates user, product availability, and stock
     */
    public Mono<Cart> addItemToCartWithValidation(String token, Integer productId, int quantity) {
        LOG.debug("Adding item to cart: product={}, quantity={}", productId, quantity);
        
        return userValidationService.validateUserOrFail(token)
                .flatMap(user -> 
                    productValidationService.validateProductForCart(productId, quantity)
                        .flatMap(product -> {
                            CartItem item = createCartItem(product, quantity);
                            return addItemToCart(user.getId(), item);
                        }))
                .doOnSuccess(cart -> LOG.info("Item added to cart successfully: product={}, user={}", 
                    productId, cart.getUserId()))
                .doOnError(error -> LOG.warn("Failed to add item to cart: product={}, error={}", 
                    productId, error.getMessage()));
    }
    
    /**
     * Add item to cart (internal method)
     */
    public Mono<Cart> addItemToCart(Integer userId, CartItem item) {
        if (item == null || !item.isValid()) {
            return Mono.error(new IllegalArgumentException("Invalid cart item"));
        }
        
        return getCart(userId)
                .flatMap(cart -> {
                    cart.addItem(item);
                    return saveCart(cart)
                            .then(Mono.just(cart));
                });
    }
    
    /**
     * Remove item from cart with user validation
     */
    public Mono<Cart> removeItemFromCartWithValidation(String token, Integer productId) {
        return userValidationService.getUserIdFromToken(token)
                .flatMap(userId -> removeItemFromCart(userId, productId))
                .doOnSuccess(cart -> LOG.debug("Item removed from cart: product={}, user={}", 
                    productId, cart.getUserId()));
    }
    
    /**
     * Remove item from cart (internal method)
     */
    public Mono<Cart> removeItemFromCart(Integer userId, Integer productId) {
        return getCart(userId)
                .flatMap(cart -> {
                    cart.removeItem(productId);
                    return saveCart(cart)
                            .then(Mono.just(cart));
                });
    }
    
    /**
     * Update item quantity with validation
     */
    public Mono<Cart> updateItemQuantityWithValidation(String token, Integer productId, int quantity) {
        return userValidationService.getUserIdFromToken(token)
                .flatMap(userId -> 
                    productValidationService.hasStockForQuantity(productId, quantity)
                        .flatMap(hasStock -> {
                            if (!hasStock) {
                                return Mono.error(new ProductValidationException(
                                    "Insufficient stock for requested quantity"));
                            }
                            return updateItemQuantity(userId, productId, quantity);
                        }))
                .doOnSuccess(cart -> LOG.debug("Item quantity updated: product={}, quantity={}", 
                    productId, quantity));
    }
    
    /**
     * Update item quantity (internal method)
     */
    public Mono<Cart> updateItemQuantity(Integer userId, Integer productId, int quantity) {
        return getCart(userId)
                .flatMap(cart -> {
                    if (cart.updateItemQuantity(productId, quantity)) {
                        return saveCart(cart)
                                .then(Mono.just(cart));
                    } else {
                        return Mono.error(new RuntimeException("Product not found in cart"));
                    }
                });
    }
    
    /**
     * Clear entire cart with user validation
     */
    public Mono<Boolean> clearCartWithValidation(String token) {
        return userValidationService.getUserIdFromToken(token)
                .flatMap(this::clearCart)
                .doOnSuccess(cleared -> LOG.debug("Cart cleared for validated user"));
    }
    
    /**
     * Clear entire cart (internal method)
     */
    public Mono<Boolean> clearCart(Integer userId) {
        String redisKey = "cart:" + userId;
        
        if (isRedisAvailable()) {
            // Clear from Redis
            return redisTemplate.delete(redisKey)
                    .map(count -> {
                        // Also clear from fallback storage (just in case)
                        fallbackCartStorage.remove(userId);
                        // Always return true for successful operation
                        LOG.debug("Cart cleared from Redis for user {}, keys deleted: {}", userId, count);
                        return true;
                    })
                    .onErrorResume(error -> {
                        LOG.warn("Redis error during cart clear, clearing fallback storage: {}", error.getMessage());
                        fallbackCartStorage.remove(userId);
                        return Mono.just(true);
                    });
        } else {
            // Clear from fallback storage
            LOG.debug("Clearing cart from fallback storage for user: {}", userId);
            Cart removedCart = fallbackCartStorage.remove(userId);
            boolean wasRemoved = removedCart != null;
            LOG.debug("Cart cleared from fallback storage for user {}, cart existed: {}", userId, wasRemoved);
            return Mono.just(true); // Always return true for successful operation
        }
    }
    
    /**
     * Validate entire cart for checkout
     * Checks user, all products, stock, and pricing
     */
    public Mono<Cart> validateCartForCheckout(String token) {
        LOG.debug("Validating cart for checkout");
        
        return userValidationService.validateUserOrFail(token)
                .flatMap(user -> 
                    getCart(user.getId())
                        .flatMap(cart -> {
                            if (cart.isEmpty()) {
                                return Mono.error(new IllegalStateException("Cart is empty"));
                            }
                            
                            return productValidationService.validateCartForCheckout(cart.getItems())
                                    .flatMap(validProducts -> refreshCartPrices(cart, validProducts))
                                    .doOnSuccess(validatedCart -> LOG.info("Cart validation successful for checkout: user={}, items={}", 
                                        user.getId(), validatedCart.getItemCount()));
                        }))
                .doOnError(error -> LOG.warn("Cart validation failed for checkout: {}", error.getMessage()));
    }
    
    /**
     * Refresh cart with current product information
     * Updates prices and removes unavailable products
     */
    public Mono<Cart> refreshCartWithValidation(String token) {
        return userValidationService.getUserIdFromToken(token)
                .flatMap(userId -> 
                    getCart(userId)
                        .flatMap(cart -> 
                            productValidationService.refreshCartItems(cart.getItems())
                                .map(refreshedItems -> {
                                    cart.setItems(refreshedItems);
                                    cart.calculateTotal();
                                    return cart;
                                })
                                .flatMap(this::saveCart)
                                .then(Mono.just(cart))))
                .doOnSuccess(cart -> LOG.debug("Cart refreshed: {} items remain", cart.getItemCount()));
    }
    
    /**
     * Get cart item count with validation
     */
    public Mono<Integer> getCartItemCountWithValidation(String token) {
        return getCartWithValidation(token)
                .map(Cart::getItemCount);
    }
    
    /**
     * Get cart total with validation
     */
    public Mono<BigDecimal> getCartTotalWithValidation(String token) {
        return getCartWithValidation(token)
                .map(cart -> BigDecimal.valueOf(cart.getTotal())); // Convert float to BigDecimal
    }
    
    /**
     * Admin method - get all carts
     */
    public Flux<Cart> getAllCartsForAdmin(String token) {
        return userValidationService.isUserAdmin(token)
                .flatMapMany(isAdmin -> {
                    if (!isAdmin) {
                        return Flux.error(new UserValidationException("Admin access required"));
                    }
                    return getAllCarts();
                });
    }
    
    /**
     * Get all carts (internal method)
     */
    public Flux<Cart> getAllCarts() {
        return redisTemplate.keys("cart:*")
                .flatMap(cartOps::get)
                .doOnNext(cart -> LOG.debug("Retrieved cart for user {}", cart.getUserId()));
    }
    
    /**
     * Check if cart exists
     */
    public Mono<Boolean> cartExists(Integer userId) {
        String redisKey = "cart:" + userId;
        return redisTemplate.hasKey(redisKey);
    }
    
    /**
     * Create CartItem from ProductResponse with proper type conversion
     */
    private CartItem createCartItem(ProductResponse product, int quantity) {
        CartItem item = new CartItem();
        item.setProductId(product.getId());
        item.setQuantity(quantity);
        
        // Convert BigDecimal to float for CartItem
        item.setPrice(product.getPrice().floatValue());
        
        // Set additional properties from product
        item.setSku(product.getSku());
        item.setTitle(product.getTitle());
        item.setCurrency(product.getCurrency() != null ? product.getCurrency() : "USD");
        
        return item;
    }
    
    /**
     * Refresh cart prices with validated products - fixed type conversion
     */
    private Mono<Cart> refreshCartPrices(Cart cart, List<ProductResponse> validProducts) {
        // Update cart items with current prices
        validProducts.forEach(product -> {
            cart.getItems().stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .forEach(item -> {
                    float currentPrice = product.getPrice().floatValue(); // Convert BigDecimal to float
                    if (item.getPrice() != currentPrice) { // Compare floats directly
                        LOG.info("Price updated for product {}: {} -> {}", 
                            product.getId(), item.getPrice(), currentPrice);
                        item.setPrice(currentPrice);
                    }
                });
        });
        
        cart.calculateTotal();
        return saveCart(cart).then(Mono.just(cart));
    }
    
    /**
     * Validate cart (legacy method for backward compatibility)
     */
    public Mono<Boolean> validateCart(Integer userId) {
        return getCart(userId)
                .map(cart -> {
                    if (cart.isEmpty()) {
                        return false;
                    }
                    
                    // Check if all items are valid
                    for (CartItem item : cart.getItems()) {
                        if (!item.isValid()) {
                            return false;
                        }
                    }
                    
                    return true;
                });
    }
}