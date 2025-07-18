package com.ecommerce.cart.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private String email;
    private String name;
    private String role;
    private String status;
    
    public boolean isAdmin() {
        return "admin".equals(role);
    }
    
    public boolean isActive() {
        return "active".equals(status);
    }
}