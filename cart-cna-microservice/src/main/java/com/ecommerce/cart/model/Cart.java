package com.ecommerce.cart.model;

import java.util.List;
import java.util.ArrayList;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    private Long userId;  // Changed from customerId to userId
    private List<CartItem> items;
    private float total;
    private String currency;
    
    // Constructor with default values
    public Cart(Long userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
        this.total = 0.0f;
        this.currency = "USD";
    }
    
    // Helper method to generate Redis key
    public String getRedisKey() {
        return "cart:" + userId;
    }
    
    // Calculate total from items
    public void calculateTotal() {
        if (items == null || items.isEmpty()) {
            this.total = 0.0f;
            return;
        }
        
        float calculatedTotal = 0.0f;
        for (CartItem item : items) {
            calculatedTotal += item.getTotalPrice();
        }
        this.total = calculatedTotal;
    }
    
    // Add item to cart
    public void addItem(CartItem newItem) {
        if (items == null) {
            items = new ArrayList<>();
        }
        
        // Check if item already exists
        boolean found = false;
        for (CartItem existingItem : items) {
            if (existingItem.getProductId().equals(newItem.getProductId())) {
                existingItem.setQuantity(existingItem.getQuantity() + newItem.getQuantity());
                found = true;
                break;
            }
        }
        
        if (!found) {
            items.add(newItem);
        }
        
        calculateTotal();
    }
    
    // Remove item from cart
    public boolean removeItem(Integer productId) {
        if (items == null) return false;
        
        boolean removed = items.removeIf(item -> item.getProductId().equals(productId));
        if (removed) {
            calculateTotal();
        }
        return removed;
    }
    
    // Update item quantity
    public boolean updateItemQuantity(Integer productId, int quantity) {
        if (items == null) return false;
        
        for (CartItem item : items) {
            if (item.getProductId().equals(productId)) {
                if (quantity <= 0) {
                    return removeItem(productId);
                } else {
                    item.setQuantity(quantity);
                    calculateTotal();
                    return true;
                }
            }
        }
        return false;
    }
    
    // Clear all items
    public void clearItems() {
        if (items != null) {
            items.clear();
        }
        this.total = 0.0f;
    }
    
    // Get item count
    public int getItemCount() {
        if (items == null) return 0;
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }
    
    // Check if cart is empty
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
    
    // Validation method
    public boolean isValid() {
        return userId != null && items != null;
    }
}