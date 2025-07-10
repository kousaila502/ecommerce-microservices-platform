package com.ecommerce.cart.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Integer productId;     // Changed from String to Integer to match Order Service
    private String sku;
    private String title;
    private int quantity;
    private float price;
    private String currency;
    
    // Helper method to calculate total price for this item
    public float getTotalPrice() {
        return price * quantity;
    }
    
    // Validation method
    public boolean isValid() {
        return productId != null && 
               title != null && !title.trim().isEmpty() &&
               quantity > 0 && 
               price > 0;
    }
}