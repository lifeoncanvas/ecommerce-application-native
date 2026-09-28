package com.ecommerce.app.controller;

import com.ecommerce.app.dto.ApiResponse;
import com.ecommerce.app.dto.RegisterRequest;
import com.ecommerce.app.dto.VerifyEmailRequest;
import com.ecommerce.app.dto.LoginRequest;
import com.ecommerce.app.dto.ForgotPasswordRequest;
import com.ecommerce.app.dto.ResetPasswordRequest;
import com.ecommerce.app.dto.SetPasswordRequest;
import com.ecommerce.app.dto.VerifyOtpRequest;
import com.ecommerce.app.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

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

    @PostMapping("/set-password")
    public ResponseEntity<ApiResponse> setPassword(@RequestBody SetPasswordRequest request) {
        try {
            authService.setPassword(request);
            return ResponseEntity.ok(new ApiResponse("Password set successfully and account activated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.resendOtp(email);
            return ResponseEntity.ok(new ApiResponse("OTP sent to your email"));
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> response = authService.loginUser(request);
            return ResponseEntity.ok(Map.of("data", response));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(new ApiResponse("Password reset code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-forgot-password-otp")
    public ResponseEntity<ApiResponse> verifyForgotPasswordOtp(@RequestBody VerifyOtpRequest request) {
        try {
            authService.verifyForgotPasswordOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new ApiResponse("OTP verified successfully. You can now reset your password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse("Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<ApiResponse> sendLoginOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.sendLoginOtp(email);
            return ResponseEntity.ok(new ApiResponse("Login OTP code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/login-with-otp")
    public ResponseEntity<?> loginWithOtp(@RequestBody VerifyOtpRequest request) {
        try {
            Map<String, Object> response = authService.loginWithOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(Map.of("data", response));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            authService.verifyEmail(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new ApiResponse("Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.resendOtp(email);
            return ResponseEntity.ok(new ApiResponse("OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginGoogle(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of("data", Map.of("token", "mock-google-token-" + System.currentTimeMillis(), "user", Map.of("email", "google_user@gmail.com", "name", "Google User", "role", "CUSTOMER"))));
    }

    @PostMapping("/apple")
    public ResponseEntity<?> loginApple(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of("data", Map.of("token", "mock-apple-token-" + System.currentTimeMillis(), "user", Map.of("email", "apple_user@apple.com", "name", "Apple User", "role", "CUSTOMER"))));
    }

    @PostMapping("/facebook")
    public ResponseEntity<?> loginFacebook(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of("data", Map.of("token", "mock-facebook-token-" + System.currentTimeMillis(), "user", Map.of("email", "facebook_user@fb.com", "name", "Facebook User", "role", "CUSTOMER"))));
    }

    @PostMapping("/kingschat")
    public ResponseEntity<?> loginKingschat(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of("data", Map.of("token", "mock-kingschat-token-" + System.currentTimeMillis(), "user", Map.of("email", "kc_user@kingschat.com", "name", "KingsChat User", "role", "CUSTOMER"))));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(new ApiResponse("Logged out successfully"));
    }
}
