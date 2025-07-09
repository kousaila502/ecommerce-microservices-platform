package com.ecommerce.cart.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class Cart {
    private Long userId;  // Changed from customerId to userId
    private List<CartItem> items;
    private float total;
    private String currency;
    
    // Helper method to generate Redis key
    public String getRedisKey() {
        return "cart:" + userId;
    }
}