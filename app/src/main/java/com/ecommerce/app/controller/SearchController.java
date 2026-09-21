package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam(required = false, defaultValue = "") String q) {
        List<ProductDto> all = productService.getAllProducts();
        if (q.trim().isEmpty()) return ResponseEntity.ok(all);
        List<ProductDto> filtered = all.stream()
            .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(q.toLowerCase()))
            .toList();
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<?> getSearchSuggestions(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(List.of("Shoes", "Jeans", "T-Shirt", "Wireless Headphones", "Jackets"));
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getSearchFilters() {
        return ResponseEntity.ok(Map.of(
            "categories", List.of("Fashion", "Electronics", "Beauty"),
            "priceRange", Map.of("min", 0, "max", 5000),
            "ratings", List.of(4.5, 4.0, 3.5)
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getSearchHistory() {
        return ResponseEntity.ok(List.of("Casual Outfit", "Denim Jacket", "Sneakers"));
    }
}
