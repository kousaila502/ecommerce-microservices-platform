package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.ArrayList;

@Service
public class CartService {
    
    private final ReactiveRedisTemplate<String, Cart> redisTemplate;
    private final ReactiveValueOperations<String, Cart> cartOps;
    
    @Autowired
    public CartService(ReactiveRedisTemplate<String, Cart> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.cartOps = redisTemplate.opsForValue();
    }
    
    /**
     * Get user's cart by user ID
     */
    public Mono<Cart> getCart(Long userId) {
        String redisKey = "cart:" + userId;
        return cartOps.get(redisKey)
                .switchIfEmpty(Mono.just(new Cart(userId)));
    }
    
    /**
     * Save cart to Redis
     */
    public Mono<Boolean> saveCart(Cart cart) {
        if (cart == null || !cart.isValid()) {
            return Mono.just(false);
        }
        
        cart.calculateTotal();
        String redisKey = cart.getRedisKey();
        return cartOps.set(redisKey, cart);
    }
    
    /**
     * Add item to cart
     */
    public Mono<Cart> addItemToCart(Long userId, CartItem item) {
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
     * Remove item from cart
     */
    public Mono<Cart> removeItemFromCart(Long userId, Integer productId) {
        return getCart(userId)
                .flatMap(cart -> {
                    cart.removeItem(productId);
                    return saveCart(cart)
                            .then(Mono.just(cart));
                });
    }
    
    /**
     * Update item quantity in cart
     */
    public Mono<Cart> updateItemQuantity(Long userId, Integer productId, int quantity) {
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
     * Clear entire cart
     */
    public Mono<Boolean> clearCart(Long userId) {
        String redisKey = "cart:" + userId;
        return redisTemplate.delete(redisKey)
                .map(count -> count > 0);
    }
    
    /**
     * Update entire cart (for bulk operations)
     */
    public Mono<Cart> updateCart(Cart cart) {
        if (cart == null || !cart.isValid()) {
            return Mono.error(new IllegalArgumentException("Invalid cart"));
        }
        
        return saveCart(cart)
                .then(Mono.just(cart));
    }
    
    /**
     * Get all carts (for admin/debugging)
     */
    public Flux<Cart> getAllCarts() {
        return redisTemplate.keys("cart:*")
                .flatMap(cartOps::get);
    }
    
    /**
     * Check if cart exists
     */
    public Mono<Boolean> cartExists(Long userId) {
        String redisKey = "cart:" + userId;
        return redisTemplate.hasKey(redisKey);
    }
    
    /**
     * Get cart item count
     */
    public Mono<Integer> getCartItemCount(Long userId) {
        return getCart(userId)
                .map(Cart::getItemCount);
    }
    
    /**
     * Get cart total
     */
    public Mono<Float> getCartTotal(Long userId) {
        return getCart(userId)
                .map(Cart::getTotal);
    }
    
    /**
     * Validate cart before checkout
     */
    public Mono<Boolean> validateCart(Long userId) {
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