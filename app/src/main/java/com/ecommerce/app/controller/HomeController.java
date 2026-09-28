package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "*")
public class HomeController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getHomeFeed() {
        List<ProductDto> products = productService.getAllProducts();
        return ResponseEntity.ok(Map.of(
            "banners", getBanners().getBody(),
            "featured", products,
            "flashSale", products,
            "latest", products,
            "popular", products,
            "recommended", products
        ));
    }

    @GetMapping("/banners")
    public ResponseEntity<?> getBanners() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "title", "Summer Collection 2026", "subtitle", "Up to 50% Off", "imageUrl", "https://images.unsplash.com/photo-1441986300917-64674bd600d8"),
            Map.of("id", 2, "title", "New Electronics Arrival", "subtitle", "Best prices guaranteed", "imageUrl", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e")
        ));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> getFeatured() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<List<ProductDto>> getFlashSale() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getHomeCategories() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "Fashion", "icon", "shirt"),
            Map.of("id", 2, "name", "Electronics", "icon", "device-mobile"),
            Map.of("id", 3, "name", "Home & Living", "icon", "house"),
            Map.of("id", 4, "name", "Beauty", "icon", "sparkles")
        ));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<ProductDto>> getLatest() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<ProductDto>> getPopular() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<ProductDto>> getRecommended() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
