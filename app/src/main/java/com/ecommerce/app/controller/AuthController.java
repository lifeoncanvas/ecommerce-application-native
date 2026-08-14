package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import com.ecommerce.app.dto.RegisterRequest;
import com.ecommerce.app.dto.VerifyEmailRequest;
import com.ecommerce.app.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // For development, allow React Native app to access
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        try {
            authService.registerUser(request);
            return ResponseEntity.ok(new ApiResponse("Verification code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestBody VerifyEmailRequest request) {
        try {
            authService.verifyEmail(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new ApiResponse("Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-email-otp")
    public ResponseEntity<ApiResponse> resendEmailOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.resendOtp(email);
            return ResponseEntity.ok(new ApiResponse("Verification code resent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}
