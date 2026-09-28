package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import com.ecommerce.app.dto.CreateProductRequest;
import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.dto.StoreDto;
import com.ecommerce.app.service.ProductService;
import com.ecommerce.app.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private StoreService storeService;

    @GetMapping("/stores/{storeId}/products")
    public ResponseEntity<List<ProductDto>> getProductsByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getProductsByStore(storeId));
    }

    @PostMapping("/stores/{storeId}/products")
    public ResponseEntity<?> createProductForStore(
            @PathVariable Long storeId,
            @RequestBody CreateProductRequest request) {
        try {
            ProductDto created = productService.createProduct(storeId, request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/stores/my-store/products")
    public ResponseEntity<?> createProductForMyStore(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email,
            @RequestBody CreateProductRequest request) {
        try {
            StoreDto myStore = storeService.getStoreForUser(email);
            ProductDto created = productService.createProduct(myStore.getId(), request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "nike@store.com") String email,
            @RequestBody CreateProductRequest request) {
        try {
            ProductDto updated = productService.updateProduct(id, request, email);
            return ResponseEntity.ok(updated);
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(new ApiResponse(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PatchMapping("/products/{id}/status")
    public ResponseEntity<?> toggleProductStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            ProductDto updated = productService.toggleProductStatus(id, active, email);
            return ResponseEntity.ok(updated);
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(new ApiResponse(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @GetMapping("/stores/my-store/activities")
    public ResponseEntity<?> getMyStoreActivities(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            StoreDto myStore = storeService.getStoreForUser(email);
            return ResponseEntity.ok(productService.getStoreActivities(myStore.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            productService.deleteProduct(id, email);
            return ResponseEntity.ok(new ApiResponse("Product deleted successfully"));
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(new ApiResponse(rse.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/vendor/{vendorId}")
    public ResponseEntity<List<ProductDto>> getProductsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(productService.getProductsByStore(vendorId));
    }

    @GetMapping("/products/filter")
    public ResponseEntity<List<ProductDto>> getFilteredProducts(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}/reviews")
    public ResponseEntity<?> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "userName", "Sarah J.", "rating", 5, "comment", "Excellent quality!", "date", "2026-09-15"),
            Map.of("id", 2, "userName", "David K.", "rating", 4, "comment", "Fits well and comfortable.", "date", "2026-09-10")
        ));
    }

    @GetMapping("/products/{id}/related")
    public ResponseEntity<List<ProductDto>> getRelatedProducts(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
