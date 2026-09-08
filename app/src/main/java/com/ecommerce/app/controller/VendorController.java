package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.dto.StoreDto;
import com.ecommerce.app.model.ProductActivity;
import com.ecommerce.app.model.Store;
import com.ecommerce.app.model.StoreUser;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.StoreRepository;
import com.ecommerce.app.repository.StoreUserRepository;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.ProductService;
import com.ecommerce.app.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * VendorController - Dedicated endpoint for Vendor Portal operations.
 * All routes are under /api/vendor and scoped by the vendor's email.
 *
 * Routes:
 *   GET  /api/vendor/dashboard?email=   → Summary stats (store, products, activities)
 *   GET  /api/vendor/products?email=    → Products belonging to the vendor's store only
 *   PUT  /api/vendor/store?email=       → Update the vendor's own store profile
 *   GET  /api/vendor/activities?email=  → Activity log for the vendor's store
 */
@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private StoreService storeService;

    @Autowired
    private ProductService productService;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private StoreUserRepository storeUserRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerVendor(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("businessEmail");
            if (email == null) email = "nike@store.com"; // fallback
            
            User user = userRepository.findByEmail(email).orElse(null);
            
            Store store = new Store();
            store.setName((String) payload.get("businessName"));
            store.setDescription((String) payload.get("businessDescription"));
            store.setCategory("Retail");
            store = storeRepository.save(store);
            
            if (user != null) {
                StoreUser storeUser = new StoreUser(store, user, "OWNER");
                storeUserRepository.save(storeUser);
            }
            
            return ResponseEntity.ok(Map.of("vendorId", store.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/vendor/dashboard?email=nike@store.com
     * Returns a combined summary: store info + product counts + recent 10 activities.
     * This eliminates the need for 3 separate API calls from the frontend.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getVendorDashboard(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            StoreDto store = storeService.getStoreForUser(email);
            List<ProductDto> products = productService.getProductsByStore(store.getId());
            List<ProductActivity> recentActivities = productService.getStoreActivities(store.getId());

            long activeCount = products.stream().filter(ProductDto::isActive).count();
            long inactiveCount = products.stream().filter(p -> !p.isActive()).count();
            long outOfStockCount = products.stream()
                    .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() == 0)
                    .count();

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("store", store);
            dashboard.put("products", products);
            dashboard.put("recentActivities", recentActivities.stream().limit(10).toList());
            dashboard.put("stats", Map.of(
                    "totalProducts", products.size(),
                    "activeProducts", activeCount,
                    "inactiveProducts", inactiveCount,
                    "outOfStock", outOfStockCount
            ));

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/vendor/products?email=nike@store.com
     * Returns ONLY products owned by this vendor's store (strict isolation).
     */
    @GetMapping("/products")
    public ResponseEntity<?> getMyProducts(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            StoreDto store = storeService.getStoreForUser(email);
            List<ProductDto> products = productService.getProductsByStore(store.getId());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/vendor/activities?email=nike@store.com
     * Returns the change history log for the vendor's store.
     */
    @GetMapping("/activities")
    public ResponseEntity<?> getMyActivities(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email) {
        try {
            StoreDto store = storeService.getStoreForUser(email);
            List<ProductActivity> activities = productService.getStoreActivities(store.getId());
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/vendor/store?email=nike@store.com
     * Allows a vendor to update their own store profile (name, description, phone, address).
     */
    @PutMapping("/store")
    public ResponseEntity<?> updateMyStore(
            @RequestParam(required = false, defaultValue = "nike@store.com") String email,
            @RequestBody StoreDto updateDto) {
        try {
            StoreDto myStore = storeService.getStoreForUser(email);
            StoreDto updated = storeService.updateStore(myStore.getId(), updateDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}
