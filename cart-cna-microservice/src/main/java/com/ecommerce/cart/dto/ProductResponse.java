
package com.ecommerce.cart.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/**
 * DTO for Product data from Product Service
 * Represents the actual product information within the API response wrapper
 */

@Schema(description = "Product information from Product Service")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductResponse {


    @Schema(description = "Unique product identifier", example = "456", required = true)
    @JsonProperty("_id")
    private Integer id;


    @Schema(description = "Product SKU code", example = "WH-001", required = true)
    @JsonProperty("sku")
    private String sku;


    @Schema(description = "Product title or name", example = "Wireless Headphones", required = true)
    @JsonProperty("title")
    private String title;


    @Schema(description = "Detailed product description", example = "High-fidelity wireless headphones with noise cancellation.")
    @JsonProperty("description")
    private String description;


    @Schema(description = "Product price in specified currency", example = "99.99", required = true)
    @JsonProperty("price")
    private BigDecimal price;


    @Schema(description = "Currency code for product price", example = "USD", required = true)
    @JsonProperty("currency")
    private String currency;


    @Schema(description = "Product category", example = "Electronics")
    @JsonProperty("category")
    private String category;


    @Schema(description = "Department or section for the product", example = "Audio")
    @JsonProperty("department")
    private String department;


    @Schema(description = "URL to product image", example = "https://example.com/images/headphones.jpg")
    @JsonProperty("image")
    private String image;


    @Schema(description = "Available stock quantity", example = "25", required = true)
    @JsonProperty("stock")
    private Integer stock;


    @Schema(description = "Average customer rating (1.0 to 5.0)", example = "4.7")
    @JsonProperty("rating")
    private Double rating;


    @Schema(description = "Brand or manufacturer name", example = "Sony")
    @JsonProperty("brand")
    private String brand;


    @Schema(description = "Whether the product is active and available for sale", example = "true", required = true)
    @JsonProperty("isActive")
    private Boolean isActive;


    @Schema(description = "Timestamp when product was created", example = "2024-01-01T12:00:00Z", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("createdAt")
    private String createdAt;


    @Schema(description = "Timestamp when product was last updated", example = "2024-06-01T08:30:00Z", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("updatedAt")
    private String updatedAt;

    // Default constructor for JSON deserialization
    public ProductResponse() {}

    // Constructor for testing/manual creation
    public ProductResponse(Integer id, String sku, String title, BigDecimal price, Integer stock, Boolean isActive) {
        this.id = id;
        this.sku = sku;
        this.title = title;
        this.price = price;
        this.stock = stock;
        this.isActive = isActive;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
        return isActive != null && isActive;
    }

    public boolean hasStock() {
        return stock != null && stock > 0;
    }

    public boolean isAvailableForPurchase() {
        return isActive() && hasStock();
    }

    public boolean hasValidPrice() {
        return price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    public String toString() {
        return "ProductResponse{" +
                "id=" + id +
                ", sku='" + sku + '\'' +
                ", title='" + title + '\'' +
                ", price=" + price +
                ", stock=" + stock +
                ", isActive=" + isActive +
                '}';
    }
}