package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserProfileController {

    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile() {
        return ResponseEntity.ok(Map.of(
            "id", 1,
            "name", "Sharon",
            "email", "user@example.com",
            "phone", "+1 234 567 8900",
            "profileImage", "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
        ));
    }

    @PutMapping("/users/profile")
    public ResponseEntity<ApiResponse> updateUserProfile(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Profile updated successfully"));
    }

    @PostMapping("/upload/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", "https://images.unsplash.com/photo-1534528741775-53994a69daeb", "message", "Image uploaded successfully"));
    }

    @PostMapping("/upload/vendor")
    public ResponseEntity<?> uploadVendorDocument(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", "https://example.com/vendor-doc.pdf", "message", "Document uploaded successfully"));
    }

    @PostMapping("/vendor/products/upload-images")
    public ResponseEntity<?> uploadProductImages(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("urls", java.util.List.of("https://images.unsplash.com/photo-1542291026-7eec264c27ff")));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(Map.of(
            "notificationsEnabled", true,
            "darkMode", false,
            "currency", "USD",
            "language", "EN"
        ));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse> updateSettings(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Settings saved"));
    }

    @PutMapping("/users/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(new ApiResponse("Password changed successfully"));
    }

    @DeleteMapping("/users")
    public ResponseEntity<ApiResponse> deleteAccount() {
        return ResponseEntity.ok(new ApiResponse("Account deleted successfully"));
    }
}
