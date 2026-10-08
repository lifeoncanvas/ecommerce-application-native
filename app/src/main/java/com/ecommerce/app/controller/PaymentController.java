package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PaymentController {



    @PostMapping("/payment/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(Map.of("verified", true, "reference", payload.getOrDefault("reference", "REF-MOCK"), "status", "PAID"));
    }

    @PostMapping("/paystack/verify")
    public ResponseEntity<?> verifyPaystackPayment(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(Map.of("verified", true, "reference", payload.getOrDefault("reference", "PAYSTACK-MOCK"), "status", "SUCCESS"));
    }

    @GetMapping("/payment/history")
    public ResponseEntity<?> getPaymentHistory() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "reference", "PAYSTACK-987123", "amount", 95000.0, "gateway", "Paystack", "status", "COMPLETED", "date", "2026-09-20")
        ));
    }
}
