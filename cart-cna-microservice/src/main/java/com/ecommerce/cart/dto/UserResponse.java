
package com.ecommerce.cart.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for User Service response from /auth/me endpoint
 * Represents the user information returned by the User Service
 */

@Schema(description = "User information from User Service")
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponse {


    @Schema(description = "Unique user identifier", example = "123")
    @JsonProperty("id")
    private Integer id;


    @Schema(description = "User's email address", example = "john.doe@example.com")
    @JsonProperty("email")
    private String email;


    @Schema(description = "Full name of the user", example = "John Doe")
    @JsonProperty("name")
    private String name;


    @Schema(description = "Role of the user in the system", example = "user")
    @JsonProperty("role")
    private String role;


    @Schema(description = "Account status of the user", example = "active")
    @JsonProperty("status")
    private String status;


    @Schema(description = "User's mobile phone number", example = "+15551234567")
    @JsonProperty("mobile")
    private String mobile;


    @Schema(description = "Timestamp when the user account was created", example = "2024-01-01T12:00:00Z", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("created_at")
    private String createdAt;


    @Schema(description = "Timestamp when the user account was last updated", example = "2024-06-01T08:30:00Z", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("updated_at")
    private String updatedAt;

    // Default constructor for JSON deserialization
    public UserResponse() {}

    // Constructor for testing/manual creation
    public UserResponse(Integer id, String email, String name, String role, String status) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Convenience methods for validation
    public boolean isActive() {
        return "active".equalsIgnoreCase(status);
    }

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }

    public boolean isUser() {
        return "user".equalsIgnoreCase(role);
    }

    @Override
    public String toString() {
        return "UserResponse{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}