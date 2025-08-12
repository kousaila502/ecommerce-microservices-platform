package com.ecommerce.cart.model;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotNull;
import javax.validation.Valid;

import java.util.List;
import java.util.ArrayList;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Schema(
    description = "Shopping cart containing user's selected items",
    example = "{\"userId\":123,\"items\":[{\"productId\":456,\"title\":\"Wireless Headphones\",\"quantity\":2,\"price\":29.99,\"currency\":\"USD\"}],\"total\":59.98,\"currency\":\"USD\"}"
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    
    @Schema(description = "Unique identifier of the cart owner", example = "123", required = true)
    @NotNull(message = "User ID is required")
    private Integer userId;

    @Schema(description = "List of items in the cart")
    @Valid
    private List<CartItem> items = new ArrayList<>();

    @Schema(description = "Total price of all items in cart", example = "59.98", accessMode = Schema.AccessMode.READ_ONLY)
    private float total;

    @Schema(description = "Currency for all prices in cart", example = "USD", defaultValue = "USD")
    private String currency = "USD";
    
    // Constructor with default values
    public Cart(Integer userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
        this.total = 0.0f;
        this.currency = "USD";
    }
    
    // Helper method to generate Redis key
    @JsonIgnore
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
    @JsonIgnore
    public int getItemCount() {
        if (items == null) return 0;
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }
    
    // Check if cart is empty
    @JsonIgnore
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
    
    // Validation method
    @JsonIgnore
    public boolean isValid() {
        return userId != null && items != null;
    }
}