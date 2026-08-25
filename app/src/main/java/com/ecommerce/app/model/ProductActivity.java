package com.ecommerce.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_activities")
public class ProductActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long storeId;

    private Long productId;

    private String productName;

    private String actionType; // Price Updated, Product Added, Image Updated, Status Changed, Product Deactivated

    private String details; // e.g. "Price changed ₦8,999 → ₦7,999"

    private LocalDateTime timestamp = LocalDateTime.now();

    public ProductActivity() {}

    public ProductActivity(Long storeId, Long productId, String productName, String actionType, String details) {
        this.storeId = storeId;
        this.productId = productId;
        this.productName = productName;
        this.actionType = actionType;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
