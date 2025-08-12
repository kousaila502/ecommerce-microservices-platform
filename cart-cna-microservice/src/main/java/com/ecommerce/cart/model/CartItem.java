package com.ecommerce.cart.model;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Min;
import javax.validation.constraints.DecimalMin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Schema(
    description = "Individual item in shopping cart",
    example = "{\"productId\":456,\"sku\":\"WH-001\",\"title\":\"Wireless Headphones\",\"quantity\":2,\"price\":29.99,\"currency\":\"USD\"}"
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    
    @Schema(description = "Product identifier", example = "456", required = true)
    @NotNull(message = "Product ID is required")
    private Integer productId;
    
    @Schema(description = "Product SKU code", example = "WH-001")
    private String sku;
    
    @Schema(description = "Product name", example = "Wireless Headphones", required = true)
    @NotBlank(message = "Product title is required")
    private String title;
    
    @Schema(description = "Quantity of this product", example = "2", required = true, minimum = "1")
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
    
    @Schema(description = "Price per unit", example = "29.99", required = true, minimum = "0.01")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private float price;
    
    @Schema(description = "Currency for the price", example = "USD", defaultValue = "USD")
    private String currency = "USD";
    
    // Helper method to calculate total price for this item
    @JsonIgnore
    public float getTotalPrice() {
        return price * quantity;
    }
    
    // Validation method
    @JsonIgnore
    public boolean isValid() {
        return productId != null && 
               title != null && !title.trim().isEmpty() &&
               quantity > 0 && 
               price > 0;
    }
}