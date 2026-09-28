package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewSupportController {

    // Product & Vendor Reviews
    @GetMapping("/reviews/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable String productId) {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "rating", 5, "comment", "Great product!", "user", "Customer A")
        ));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse> createReview(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Review submitted successfully"));
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse> updateReview(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Review updated"));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Review deleted"));
    }

    // Customer Support
    @PostMapping("/support/ticket")
    public ResponseEntity<ApiResponse> createSupportTicket(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Support ticket created"));
    }

    @GetMapping("/support/tickets")
    public ResponseEntity<?> getSupportTickets() {
        return ResponseEntity.ok(List.of(
            Map.of("ticketId", "TCK-101", "subject", "Delivery Inquiry", "status", "OPEN", "date", "2026-09-20")
        ));
    }

    // Product Exchange
    @PostMapping("/exchange/request")
    public ResponseEntity<ApiResponse> createExchangeRequest(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Exchange request submitted"));
    }

    @GetMapping("/exchange")
    public ResponseEntity<?> getExchangeRequests() {
        return ResponseEntity.ok(List.of(
            Map.of("requestId", "EX-201", "product", "Denim Jacket", "reason", "Size issue", "status", "PENDING")
        ));
    }

    @PutMapping("/exchange/cancel/{id}")
    public ResponseEntity<ApiResponse> cancelExchangeRequest(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Exchange request cancelled"));
    }

    // Loyalty Program
    @GetMapping("/loyalty")
    public ResponseEntity<?> getLoyaltyStatus() {
        return ResponseEntity.ok(Map.of("tier", "GOLD", "points", 1250, "rewards", List.of(
            Map.of("rewardId", "R1", "title", "$10 Off Voucher", "pointsCost", 500)
        )));
    }

    @PostMapping("/loyalty/redeem")
    public ResponseEntity<ApiResponse> redeemLoyaltyPoints(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Reward redeemed successfully"));
    }

    // Coupons
    @GetMapping("/coupons")
    public ResponseEntity<?> getCoupons() {
        return ResponseEntity.ok(List.of(
            Map.of("code", "WELCOME10", "discount", "10%", "description", "10% off your first order"),
            Map.of("code", "FREESHIP", "discount", "Free Shipping", "description", "Free shipping on orders above $50")
        ));
    }

    // Push Notifications
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "title", "Order Shipped! 📦", "message", "Your order #ORD-123456 has been dispatched.", "read", false, "date", "10m ago")
        ));
    }

    @PutMapping("/notifications/read/{id}")
    public ResponseEntity<ApiResponse> markNotificationRead(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Notification marked as read"));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse> markAllNotificationsRead() {
        return ResponseEntity.ok(new ApiResponse("All notifications marked as read"));
    }

    // Static CMS Content
    @GetMapping("/content/privacy-policy")
    public ResponseEntity<?> getPrivacyPolicy() {
        return ResponseEntity.ok(Map.of("title", "Privacy Policy", "content", "Licht Marketing respects your privacy..."));
    }

    @GetMapping("/content/terms")
    public ResponseEntity<?> getTermsAndConditions() {
        return ResponseEntity.ok(Map.of("title", "Terms & Conditions", "content", "Welcome to Licht Marketing..."));
    }

    @GetMapping("/content/contact")
    public ResponseEntity<?> getContactInfo() {
        return ResponseEntity.ok(Map.of("email", "support@lichtmarketing.com", "phone", "+1 800 555 0199", "address", "London, UK"));
    }

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse> submitContactForm(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Message sent successfully"));
    }
}
