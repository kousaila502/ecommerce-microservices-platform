package com.ecommerce.cart.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Integer productId;
    private String sku;
    private String title;
    private int quantity;
    private float price;
    private String currency;
    
    // Helper method to calculate total price for this item
    @JsonIgnore  // Don't serialize this method result
    public float getTotalPrice() {
        return price * quantity;
    }
    
    // Validation method
    @JsonIgnore  // Don't serialize this method result
    public boolean isValid() {
        return productId != null && 
               title != null && !title.trim().isEmpty() &&
               quantity > 0 && 
               price > 0;
    }
}