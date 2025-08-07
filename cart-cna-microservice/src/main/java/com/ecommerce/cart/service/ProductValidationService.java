package com.ecommerce.cart.service;

import com.ecommerce.cart.client.ProductServiceClient;
import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.exception.ProductValidationException;
import com.ecommerce.cart.model.CartItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for validating products with caching and business logic
 * Orchestrates ProductServiceClient calls with additional validation rules
 */
@Service
public class ProductValidationService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductValidationService.class);
    
    private final ProductServiceClient productServiceClient;

    public ProductValidationService(ProductServiceClient productServiceClient) {
        this.productServiceClient = productServiceClient;
    }

    /**
     * Validate single product for cart operations
     * Includes availability, stock, and business rules
     */
    public Mono<ProductResponse> validateProductForCart(Integer productId, int quantity) {
        LOG.debug("Validating product {} for cart with quantity {}", productId, quantity);
        
        return productServiceClient.validateProductForCart(productId, quantity)
                .flatMap(product -> applyBusinessRules(product, quantity))
                .doOnSuccess(product -> LOG.info("Product validation successful: {} - {}", 
                    product.getSku(), product.getTitle()))
                .doOnError(error -> LOG.warn("Product validation failed for {}: {}", 
                    productId, error.getMessage()));
    }

    /**
     * Get product details with caching (10 minute cache)
     * Used for display purposes and quick lookups
     */
    @Cacheable(value = "productDetails", key = "#productId", unless = "#result == null")
    public Mono<ProductResponse> getProductDetails(Integer productId) {
        LOG.debug("Getting product details (with caching) for ID: {}", productId);
        
        return productServiceClient.getProduct(productId)
                .cache(Duration.ofMinutes(10)) // Cache successful results for 10 minutes
                .doOnSuccess(product -> LOG.debug("Product details cached: {} - {}", 
                    product.getSku(), product.getTitle()));
    }

    /**
     * Validate entire cart for checkout
     * Ensures all products are still available with sufficient stock
     */
    public Mono<List<ProductResponse>> validateCartForCheckout(List<CartItem> cartItems) {
        LOG.debug("Validating cart with {} items for checkout", cartItems.size());
        
        List<Integer> productIds = cartItems.stream()
                .map(CartItem::getProductId)
                .collect(Collectors.toList());
        
        return productServiceClient.validateProducts(productIds)
                .collectList()
                .flatMap(products -> validateCartItemsAgainstProducts(cartItems, products))
                .doOnSuccess(validProducts -> LOG.info("Cart validation successful: {} products validated", 
                    validProducts.size()))
                .doOnError(error -> LOG.warn("Cart validation failed: {}", error.getMessage()));
    }

    /**
     * Check product availability without throwing exceptions
     * Returns false if product is unavailable
     */
    public Mono<Boolean> isProductAvailable(Integer productId) {
        return productServiceClient.isProductValid(productId)
                .doOnSuccess(isAvailable -> LOG.debug("Product {} availability: {}", 
                    productId, isAvailable))
                .onErrorReturn(false);
    }

    /**
     * Check if product has sufficient stock
     */
    public Mono<Boolean> hasStockForQuantity(Integer productId, int quantity) {
        return productServiceClient.hasStock(productId, quantity)
                .doOnSuccess(hasStock -> LOG.debug("Product {} stock check for qty {}: {}", 
                    productId, quantity, hasStock))
                .onErrorReturn(false);
    }

    /**
     * Get current price for product with caching
     */
    @Cacheable(value = "productPrices", key = "#productId")
    public Mono<BigDecimal> getProductPrice(Integer productId) {
        LOG.debug("Getting current price for product: {}", productId);
        
        return productServiceClient.getProductPrice(productId)
                .cache(Duration.ofMinutes(5)) // Cache prices for 5 minutes
                .doOnSuccess(price -> LOG.debug("Product {} current price: {}", productId, price))
                .doOnError(error -> LOG.warn("Failed to get price for product {}: {}", 
                    productId, error.getMessage()));
    }

    /**
     * Validate product pricing changes in cart
     * Returns products where price has changed
     */
    public Mono<List<CartItem>> findPriceChanges(List<CartItem> cartItems) {
        LOG.debug("Checking for price changes in cart with {} items", cartItems.size());
        
        return Flux.fromIterable(cartItems)
                .flatMap(item -> 
                    getProductPrice(item.getProductId())
                        .map(currentPrice -> {
                            float currentPriceFloat = currentPrice.floatValue(); // Convert BigDecimal to float
                            if (item.getPrice() != currentPriceFloat) { // Compare float to float
                                LOG.info("Price change detected for product {}: {} -> {}", 
                                    item.getProductId(), item.getPrice(), currentPriceFloat);
                                return item;
                            }
                            return null;
                        })
                        .onErrorReturn(null))
                .filter(item -> item != null)
                .collectList()
                .doOnSuccess(changedItems -> LOG.debug("Found {} items with price changes", 
                    changedItems.size()));
    }

    /**
     * Update cart items with current product information
     * Refreshes prices and validates availability
     */
    public Mono<List<CartItem>> refreshCartItems(List<CartItem> cartItems) {
        LOG.debug("Refreshing {} cart items with current product data", cartItems.size());
        
        List<Integer> productIds = cartItems.stream()
                .map(CartItem::getProductId)
                .collect(Collectors.toList());
        
        return productServiceClient.validateProducts(productIds)
                .collectMap(ProductResponse::getId)
                .map(productMap -> 
                    cartItems.stream()
                        .filter(item -> {
                            ProductResponse product = productMap.get(item.getProductId());
                            return product != null && product.isAvailableForPurchase();
                        })
                        .map(item -> {
                            ProductResponse product = productMap.get(item.getProductId());
                            // Update price if different - convert BigDecimal to float
                            float newPrice = product.getPrice().floatValue();
                            if (item.getPrice() != newPrice) {
                                item.setPrice(newPrice);
                                LOG.debug("Updated price for item {}: {}", 
                                    item.getProductId(), newPrice);
                            }
                            return item;
                        })
                        .collect(Collectors.toList()))
                .doOnSuccess(refreshedItems -> LOG.info("Refreshed cart: {} items remain valid", 
                    refreshedItems.size()));
    }

    /**
     * Apply business rules to product validation
     */
    private Mono<ProductResponse> applyBusinessRules(ProductResponse product, int quantity) {
        // Maximum quantity per product (business rule)
        if (quantity > 50) {
            return Mono.error(new ProductValidationException(
                "Maximum quantity per product is 50. Requested: " + quantity));
        }
        
        // Check if product price is reasonable (prevent price errors)
        if (!product.hasValidPrice()) {
            return Mono.error(new ProductValidationException(
                "Product has invalid price: " + product.getTitle()));
        }
        
        // Additional business rules can be added here
        // For example: restricted products, regional availability, etc.
        
        return Mono.just(product);
    }

    /**
     * Validate cart items against fetched products
     */
    private Mono<List<ProductResponse>> validateCartItemsAgainstProducts(
            List<CartItem> cartItems, List<ProductResponse> products) {
        
        Map<Integer, ProductResponse> productMap = products.stream()
                .collect(Collectors.toMap(ProductResponse::getId, p -> p));
        
        Map<Integer, Integer> quantityMap = cartItems.stream()
                .collect(Collectors.toMap(CartItem::getProductId, CartItem::getQuantity));
        
        return Mono.fromCallable(() -> {
            for (CartItem item : cartItems) {
                ProductResponse product = productMap.get(item.getProductId());
                
                if (product == null) {
                    throw new ProductValidationException(
                        "Product not found in cart: " + item.getProductId());
                }
                
                if (!product.isAvailableForPurchase()) {
                    throw new ProductValidationException(
                        "Product no longer available: " + product.getTitle());
                }
                
                int requestedQty = quantityMap.get(item.getProductId());
                if (product.getStock() < requestedQty) {
                    throw new ProductValidationException(
                        "Insufficient stock for " + product.getTitle() + 
                        ". Available: " + product.getStock() + ", Requested: " + requestedQty);
                }
            }
            
            return products;
        })
        .doOnSuccess(validProducts -> LOG.debug("Cart validation completed successfully"));
    }

    /**
     * Validate products are still active (for scheduled cleanup)
     */
    public Mono<Boolean> areAllProductsActive(List<Integer> productIds) {
        return productServiceClient.areAllProductsAvailable(productIds)
                .doOnSuccess(allActive -> LOG.debug("Bulk product activity check: {}", allActive))
                .onErrorReturn(false);
    }
}