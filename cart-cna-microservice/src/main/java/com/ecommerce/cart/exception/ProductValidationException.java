package com.ecommerce.cart.exception;

/**
 * Exception thrown when product validation fails
 * This includes product not found, inactive products, insufficient stock, or product service errors
 */
public class ProductValidationException extends RuntimeException {

    private String errorCode;
    private Object details;

    public ProductValidationException(String message) {
        super(message);
    }

    public ProductValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public ProductValidationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ProductValidationException(String message, String errorCode, Object details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public ProductValidationException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getDetails() {
        return details;
    }

    // Common product validation error types
    public static ProductValidationException productNotFound(Integer productId) {
        return new ProductValidationException("Product not found: " + productId, "PRODUCT_NOT_FOUND", productId);
    }

    public static ProductValidationException productInactive(Integer productId, String productName) {
        return new ProductValidationException("Product is not available: " + productName, "PRODUCT_INACTIVE", productId);
    }

    public static ProductValidationException insufficientStock(Integer productId, String productName, int available, int requested) {
        var stockDetails = new StockDetails(productId, productName, available, requested);
        return new ProductValidationException(
            String.format("Insufficient stock for %s. Available: %d, Requested: %d", productName, available, requested),
            "INSUFFICIENT_STOCK", 
            stockDetails
        );
    }

    public static ProductValidationException invalidQuantity(int quantity) {
        return new ProductValidationException("Invalid quantity: " + quantity, "INVALID_QUANTITY", quantity);
    }

    public static ProductValidationException serviceUnavailable() {
        return new ProductValidationException("Product service temporarily unavailable", "SERVICE_UNAVAILABLE");
    }

    public static ProductValidationException invalidPrice(Integer productId, float expectedPrice, float actualPrice) {
        var priceDetails = new PriceDetails(productId, expectedPrice, actualPrice);
        return new ProductValidationException(
            String.format("Price mismatch for product %d. Expected: %.2f, Actual: %.2f", productId, expectedPrice, actualPrice),
            "PRICE_MISMATCH",
            priceDetails
        );
    }

    // Helper classes for structured error details
    public static class StockDetails {
        private final Integer productId;
        private final String productName;
        private final int availableStock;
        private final int requestedQuantity;

        public StockDetails(Integer productId, String productName, int availableStock, int requestedQuantity) {
            this.productId = productId;
            this.productName = productName;
            this.availableStock = availableStock;
            this.requestedQuantity = requestedQuantity;
        }

        public Integer getProductId() { return productId; }
        public String getProductName() { return productName; }
        public int getAvailableStock() { return availableStock; }
        public int getRequestedQuantity() { return requestedQuantity; }
    }

    public static class PriceDetails {
        private final Integer productId;
        private final float expectedPrice;
        private final float actualPrice;

        public PriceDetails(Integer productId, float expectedPrice, float actualPrice) {
            this.productId = productId;
            this.expectedPrice = expectedPrice;
            this.actualPrice = actualPrice;
        }

        public Integer getProductId() { return productId; }
        public float getExpectedPrice() { return expectedPrice; }
        public float getActualPrice() { return actualPrice; }
    }
}