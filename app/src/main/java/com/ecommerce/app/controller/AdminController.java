package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AdminController {

    // Admin Dashboard Stats
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboardStats() {
        return ResponseEntity.ok(Map.of(
            "totalRevenue", 125400.0,
            "totalOrders", 1420,
            "totalVendors", 38,
            "totalCustomers", 8920,
            "pendingPayouts", 4500.0
        ));
    }

    @Autowired
    private com.ecommerce.app.service.AuthService authService;

    // Admin Users Management
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAdminUsers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "John Doe", "email", "john@example.com", "role", "CUSTOMER", "status", "ACTIVE")
        ));
    }

    @PostMapping("/admin/users/create")
    public ResponseEntity<ApiResponse> createAccountByAdmin(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String email = payload.get("email");
            String role = payload.getOrDefault("role", "CUSTOMER");
            String password = payload.get("password");

            authService.createAccountByAdmin(name, email, role, password);
            return ResponseEntity.ok(new ApiResponse("Account created successfully for " + email + ". Set password email sent."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/admin/users/send-set-password")
    public ResponseEntity<ApiResponse> sendSetPasswordEmail(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            authService.resendOtp(email);
            return ResponseEntity.ok(new ApiResponse("Set password email and OTP sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/users/{userId}/status")
    public ResponseEntity<ApiResponse> updateAdminUserStatus(@PathVariable Long userId, @RequestParam String status) {
        return ResponseEntity.ok(new ApiResponse("User status updated to " + status));
    }

    // Admin Vendors Management
    @GetMapping("/admin/vendors")
    public ResponseEntity<?> getAdminVendors(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "storeName", "Nike Store", "email", "nike@store.com", "status", "APPROVED")
        ));
    }

    @PutMapping("/admin/vendors/{vendorId}/status")
    public ResponseEntity<ApiResponse> updateAdminVendorStatus(@PathVariable Long vendorId, @RequestParam String status) {
        return ResponseEntity.ok(new ApiResponse("Vendor status updated to " + status));
    }

    @GetMapping("/admin/products")
    public ResponseEntity<?> getAdminProducts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAdminOrders(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/admin/payments")
    public ResponseEntity<?> getAdminPayments(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/admin/reviews")
    public ResponseEntity<?> getAdminReviews(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/admin/reports")
    public ResponseEntity<?> getAdminReports() {
        return ResponseEntity.ok(Map.of("monthlySales", List.of(12000, 18000, 24000, 31000)));
    }

    @GetMapping("/admin/settings")
    public ResponseEntity<?> getAdminSettings() {
        return ResponseEntity.ok(Map.of("platformName", "Licht Marketing", "maintenanceMode", false));
    }

    // Commissions
    @GetMapping("/v1/commissions")
    public ResponseEntity<?> getAdminCommissions() {
        return ResponseEntity.ok(List.of(
            Map.of("countryCode", "US", "rate", 5.0, "description", "Standard US Commission Rate"),
            Map.of("countryCode", "NG", "rate", 3.5, "description", "Nigeria Merchant Commission Rate")
        ));
    }

    @PostMapping("/v1/commissions/{countryCode}")
    public ResponseEntity<ApiResponse> updateAdminCommission(@PathVariable String countryCode, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Commission updated for " + countryCode));
    }

    // Merchant Earnings & Payouts
    @GetMapping("/v1/merchant/earnings")
    public ResponseEntity<?> getVendorEarnings() {
        return ResponseEntity.ok(Map.of("totalEarnings", 5400.0, "availableBalance", 1200.0, "pendingBalance", 450.0));
    }

    @GetMapping("/v1/merchant/payouts")
    public ResponseEntity<?> getVendorPayouts() {
        return ResponseEntity.ok(List.of(
            Map.of("id", "PO-101", "amount", 500.0, "status", "PAID", "date", "2026-09-18")
        ));
    }

    @PostMapping("/v1/merchant/payouts")
    public ResponseEntity<ApiResponse> requestVendorPayout(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Payout request submitted successfully"));
    }

    @GetMapping("/v1/merchant/admin/payouts")
    public ResponseEntity<?> getAdminPayouts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(List.of(
            Map.of("id", "PO-101", "vendor", "Nike Store", "amount", 500.0, "status", "PENDING")
        ));
    }

    @PutMapping("/v1/merchant/admin/payouts/{id}/approve")
    public ResponseEntity<ApiResponse> approveAdminPayout(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Payout approved"));
    }

    @PutMapping("/v1/merchant/admin/payouts/{id}/process")
    public ResponseEntity<ApiResponse> processAdminPayout(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Payout processed"));
    }

    @PutMapping("/v1/merchant/admin/payouts/{id}/fail")
    public ResponseEntity<ApiResponse> failAdminPayout(@PathVariable String id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(new ApiResponse("Payout failed: " + reason));
    }
}
