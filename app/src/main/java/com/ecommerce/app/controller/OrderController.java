package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.app.model.Order;
import com.ecommerce.app.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    private final List<Map<String, Object>> addresses = new ArrayList<>();

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Order order = new Order();
            order.setOrderReference((String) payload.getOrDefault("orderId", "ORD-UNKNOWN"));
            
            Object totalObj = payload.get("totalAmount");
            if (totalObj instanceof Number) {
                order.setTotalAmount(((Number) totalObj).doubleValue());
            }
            
            order.setPaymentMethod((String) payload.get("paymentMethod"));
            order.setPaymentReference((String) payload.get("paymentReference"));
            order.setStatus("PLACED");
            
            if (payload.containsKey("items")) {
                order.setItemsJson(mapper.writeValueAsString(payload.get("items")));
            }
            
            orderRepository.save(order);
            return ResponseEntity.ok(new ApiResponse("Order created successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse("Error creating order"));
        }
    }

    @PutMapping("/orders/cancel/{id}")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long id) {
        orderRepository.findById(id).ifPresent(order -> {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
        });
        return ResponseEntity.ok(new ApiResponse("Order cancelled"));
    }

    @GetMapping("/orders/tracking/{id}")
    public ResponseEntity<?> trackOrder(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
            "orderId", id,
            "currentStatus", "IN_TRANSIT",
            "steps", List.of(
                Map.of("title", "Order Placed", "completed", true, "timestamp", "2026-09-21 10:00"),
                Map.of("title", "Dispatched", "completed", true, "timestamp", "2026-09-21 12:00"),
                Map.of("title", "Out for Delivery", "completed", false, "timestamp", ""),
                Map.of("title", "Delivered", "completed", false, "timestamp", "")
            )
        ));
    }

    @PutMapping("/orders/status/{id}")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(new ApiResponse("Order status updated to " + body.get("status")));
    }

    // Address endpoints
    @GetMapping("/address")
    public ResponseEntity<?> getAddresses() {
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/address")
    public ResponseEntity<ApiResponse> addAddress(@RequestBody Map<String, Object> payload) {
        addresses.add(payload);
        return ResponseEntity.ok(new ApiResponse("Address added successfully"));
    }

    @PutMapping("/address/{id}")
    public ResponseEntity<ApiResponse> updateAddress(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(new ApiResponse("Address updated"));
    }

    @DeleteMapping("/address/{id}")
    public ResponseEntity<ApiResponse> deleteAddress(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Address deleted"));
    }

    @PutMapping("/address/default/{id}")
    public ResponseEntity<ApiResponse> setDefaultAddress(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse("Default address updated"));
    }

    // Shipping rates
    @GetMapping("/shipping/rates")
    public ResponseEntity<?> getShippingRates() {
        return ResponseEntity.ok(List.of(
            Map.of("id", "standard", "name", "Standard Delivery", "price", 0.0, "estimatedDays", "3-5 business days"),
            Map.of("id", "express", "name", "Express Shipping", "price", 2500.0, "estimatedDays", "1-2 business days")
        ));
    }
}
