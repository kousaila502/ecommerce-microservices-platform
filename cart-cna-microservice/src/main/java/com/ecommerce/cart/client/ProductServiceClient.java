package com.ecommerce.cart.client;

import com.ecommerce.cart.dto.ProductApiResponse;
import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.exception.ProductValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Component
public class ProductServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(ProductServiceClient.class);
    
    private final WebClient productServiceWebClient;

    public ProductServiceClient(@Qualifier("productServiceWebClient") WebClient productServiceWebClient) {
        this.productServiceWebClient = productServiceWebClient;
    }

    /**
     * Get product details by ID from Product Service
     * Returns the product if it exists and is active
     */
    public Mono<ProductResponse> getProduct(Integer productId) {
        LOG.debug("Fetching product details for ID: {}", productId);
        
        return productServiceWebClient
                .get()
                .uri("/products/{id}", productId)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals,
                    response -> Mono.error(new ProductValidationException("Product not found: " + productId)))
                .onStatus(HttpStatus::is4xxClientError,
                    response -> Mono.error(new ProductValidationException("Invalid product request: " + productId)))
                .onStatus(HttpStatus::is5xxServerError,
                    response -> Mono.error(new ProductValidationException("Product service temporarily unavailable")))
                .bodyToMono(ProductApiResponse.class)
                .flatMap(apiResponse -> {
                    if (!apiResponse.isSuccessful()) {
                        return Mono.error(new ProductValidationException(
                            "Product service returned failure: " + apiResponse.getMessage()));
                    }
                    if (!apiResponse.hasValidProduct()) {
                        return Mono.error(new ProductValidationException("Product not found: " + productId));
                    }
                    return Mono.just(apiResponse.getData());
                })
                .doOnSuccess(product -> LOG.debug("Product fetched successfully: {} - {}", 
                    product.getId(), product.getTitle()))
                .doOnError(error -> LOG.warn("Failed to fetch product {}: {}", productId, error.getMessage()))
                .retryWhen(Retry.backoff(3, Duration.ofMillis(500))
                    .filter(this::isRetryableException)
                    .doBeforeRetry(retrySignal -> 
                        LOG.warn("Retrying product fetch for ID {}, attempt: {}", 
                            productId, retrySignal.totalRetries() + 1)))
                .onErrorMap(WebClientResponseException.class, this::mapWebClientException)
                .timeout(Duration.ofSeconds(10))
                .onErrorMap(java.util.concurrent.TimeoutException.class,
                    ex -> new ProductValidationException("Product service request timed out for product: " + productId));
    }

    /**
     * Validate if product exists and is available for cart operations
     */
    public Mono<Boolean> isProductValid(Integer productId) {
        return getProduct(productId)
                .map(product -> product.isActive() && product.getId() != null)
                .doOnSuccess(isValid -> LOG.debug("Product {} validation result: {}", productId, isValid))
                .onErrorReturn(false);
    }

    /**
     * Check if product has sufficient stock for requested quantity
     */
    public Mono<Boolean> hasStock(Integer productId, int requestedQuantity) {
        return getProduct(productId)
                .map(product -> product.isActive() && product.getStock() >= requestedQuantity)
                .doOnSuccess(hasStock -> LOG.debug("Product {} stock check for qty {}: {}", 
                    productId, requestedQuantity, hasStock))
                .onErrorReturn(false);
    }

    /**
     * Get current price for a product
     */
    public Mono<BigDecimal> getProductPrice(Integer productId) {
        return getProduct(productId)
                .map(ProductResponse::getPrice)
                .doOnSuccess(price -> LOG.debug("Product {} current price: {}", productId, price));
    }

    /**
     * Validate multiple products in batch (for cart validation)
     * More efficient than individual calls for cart checkout
     */
    public Flux<ProductResponse> validateProducts(List<Integer> productIds) {
        LOG.debug("Validating {} products in batch", productIds.size());
        
        return Flux.fromIterable(productIds)
                .flatMap(this::getProduct, 5) // Concurrency of 5 for optimal performance
                .doOnNext(product -> LOG.debug("Batch validation - Product {}: {}", 
                    product.getId(), product.isActive() ? "valid" : "invalid"))
                .doOnComplete(() -> LOG.debug("Batch product validation completed"));
    }

    /**
     * Check if all products in cart are still available
     */
    public Mono<Boolean> areAllProductsAvailable(List<Integer> productIds) {
        return validateProducts(productIds)
                .all(ProductResponse::isActive)
                .doOnSuccess(allAvailable -> LOG.debug("All products available check: {}", allAvailable));
    }

    /**
     * Validate product and quantity for cart operations
     */
    public Mono<ProductResponse> validateProductForCart(Integer productId, int quantity) {
        return getProduct(productId)
                .flatMap(product -> {
                    if (!product.isActive()) {
                        return Mono.error(new ProductValidationException(
                            "Product is not available: " + product.getTitle()));
                    }
                    if (product.getStock() < quantity) {
                        return Mono.error(new ProductValidationException(
                            "Insufficient stock for product: " + product.getTitle() + 
                            ". Available: " + product.getStock() + ", Requested: " + quantity));
                    }
                    return Mono.just(product);
                })
                .doOnSuccess(product -> LOG.debug("Product validation successful for cart: {} qty {}", 
                    product.getTitle(), quantity));
    }

    /**
     * Determine if an exception is retryable
     */
    private boolean isRetryableException(Throwable throwable) {
        if (throwable instanceof WebClientResponseException) {
            WebClientResponseException ex = (WebClientResponseException) throwable;
            // Retry on 5xx errors and timeouts, but not on 4xx client errors
            return ex.getStatusCode().is5xxServerError() || 
                   ex.getStatusCode() == HttpStatus.REQUEST_TIMEOUT;
        }
        // Retry on connection issues
        return throwable instanceof java.net.ConnectException ||
               throwable instanceof java.io.IOException;
    }

    /**
     * Map WebClient exceptions to domain-specific exceptions
     */
    private ProductValidationException mapWebClientException(WebClientResponseException ex) {
        HttpStatus status = ex.getStatusCode();
        String message = switch (status.value()) {
            case 400 -> "Invalid product request";
            case 404 -> "Product not found";
            case 409 -> "Product conflict (may be deleted or inactive)";
            case 429 -> "Product service rate limit exceeded";
            case 500 -> "Product service internal error";
            case 503 -> "Product service temporarily unavailable";
            default -> "Product service error: " + status.getReasonPhrase();
        };
        
        LOG.error("Product service error - Status: {}, Message: {}", status.value(), message);
        return new ProductValidationException(message);
    }
}