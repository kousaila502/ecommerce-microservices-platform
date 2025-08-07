package com.ecommerce.cart.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/**
 * DTO for Product data from Product Service
 * Represents the actual product information within the API response wrapper
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductResponse {

    @JsonProperty("_id")
    private Integer id;

    @JsonProperty("sku")
    private String sku;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("category")
    private String category;

    @JsonProperty("department")
    private String department;

    @JsonProperty("image")
    private String image;

    @JsonProperty("stock")
    private Integer stock;

    @JsonProperty("rating")
    private Double rating;

    @JsonProperty("brand")
    private String brand;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("createdAt")
    private String createdAt;

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