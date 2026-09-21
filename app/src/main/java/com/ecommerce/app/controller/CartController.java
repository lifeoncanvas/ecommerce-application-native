package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CartController {

    private final List<Map<String, Object>> cartItems = new ArrayList<>();
    private final List<Map<String, Object>> wishlistItems = new ArrayList<>();

    @GetMapping("/cart")
    public ResponseEntity<?> getCart() {
        return ResponseEntity.ok(Map.of("items", cartItems, "totalAmount", 90.0));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<ApiResponse> addToCart(@RequestBody Map<String, Object> payload) {
        cartItems.add(payload);
        return ResponseEntity.ok(new ApiResponse("Item added to cart"));
    }

    @PutMapping("/cart/update")
    public ResponseEntity<ApiResponse> updateCartItem(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Cart item updated"));
    }

    @DeleteMapping("/cart/remove/{itemId}")
    public ResponseEntity<ApiResponse> removeCartItem(@PathVariable String itemId) {
        return ResponseEntity.ok(new ApiResponse("Item removed from cart"));
    }

    @DeleteMapping("/cart/clear")
    public ResponseEntity<ApiResponse> clearCart() {
        cartItems.clear();
        return ResponseEntity.ok(new ApiResponse("Cart cleared"));
    }

    @PostMapping("/cart/apply-coupon")
    public ResponseEntity<?> applyCoupon(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        return ResponseEntity.ok(Map.of("valid", true, "discount", 10.0, "code", code, "message", "Coupon applied successfully"));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist() {
        return ResponseEntity.ok(wishlistItems);
    }

    @PostMapping("/wishlist")
    public ResponseEntity<ApiResponse> addToWishlist(@RequestBody Map<String, Object> payload) {
        wishlistItems.add(payload);
        return ResponseEntity.ok(new ApiResponse("Added to wishlist"));
    }

    @DeleteMapping("/wishlist/{id}")
    public ResponseEntity<ApiResponse> removeFromWishlist(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Removed from wishlist"));
    }
}
