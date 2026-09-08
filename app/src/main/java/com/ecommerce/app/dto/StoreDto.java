package com.ecommerce.app.dto;

import com.ecommerce.app.model.Store;

public class StoreDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private String category;
    private Double rating;
    private String address;
    private String phone;

    public StoreDto() {}

    public StoreDto(Store store) {
        this.id = store.getId();
        this.name = store.getName();
        this.slug = store.getSlug();
        this.description = store.getDescription();
        this.logoUrl = store.getLogoUrl();
        this.category = store.getCategory();
        this.rating = store.getRating();
        this.address = store.getAddress();
        this.phone = store.getPhone();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
