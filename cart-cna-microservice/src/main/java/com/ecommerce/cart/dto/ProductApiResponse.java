package com.ecommerce.cart.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Product Service API wrapper response
 * The Product Service returns responses in format: {success: true, data: {...}}
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductApiResponse {

    @JsonProperty("success")
    private Boolean success;

    @JsonProperty("data")
    private ProductResponse data;

    @JsonProperty("message")
    private String message;

    // Default constructor for JSON deserialization
    public ProductApiResponse() {}

    // Constructor for testing
    public ProductApiResponse(Boolean success, ProductResponse data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    // Getters and setters
    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public ProductResponse getData() {
        return data;
    }

    public void setData(ProductResponse data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Convenience methods
    public boolean isSuccessful() {
        return success != null && success;
    }

    public boolean hasValidProduct() {
        return isSuccessful() && data != null;
    }

    @Override
    public String toString() {
        return "ProductApiResponse{" +
                "success=" + success +
                ", data=" + data +
                ", message='" + message + '\'' +
                '}';
    }
}