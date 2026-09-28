package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "Clothing & Fashion", "image", "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04"),
            Map.of("id", 2, "name", "Electronics & Gadgets", "image", "https://images.unsplash.com/photo-1498049794561-7780e7231661"),
            Map.of("id", 3, "name", "Footwear & Shoes", "image", "https://images.unsplash.com/photo-1542291026-7eec264c27ff"),
            Map.of("id", 4, "name", "Beauty & Personal Care", "image", "https://images.unsplash.com/photo-1596462502278-27bfdc403348")
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("id", id, "name", "Category #" + id, "description", "Category description"));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductDto>> getCategoryProducts(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
