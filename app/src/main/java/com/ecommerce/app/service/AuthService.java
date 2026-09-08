package com.ecommerce.app.service;

import com.ecommerce.app.dto.RegisterRequest;
import com.ecommerce.app.dto.LoginRequest;
import com.ecommerce.app.dto.ResetPasswordRequest;
import com.ecommerce.app.model.EmailVerificationOtp;
import com.ecommerce.app.model.User;
import com.ecommerce.app.model.StoreUser;
import com.ecommerce.app.repository.EmailVerificationOtpRepository;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.repository.StoreUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.Map;
import java.util.HashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StoreUserRepository storeUserRepository;

    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        generateAndSendOtp(user);
    }

    public void generateAndSendOtp(User user) {
        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt);
        otpRepository.save(otp);

        emailService.sendOtpEmail(user.getEmail(), otpCode);
    }

    public void verifyEmail(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpEntity.isVerified()) {
            throw new RuntimeException("OTP already used");
        }

        if (otpEntity.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        otpEntity.incrementAttempts();
        if (otpEntity.getAttempts() > 5) {
            otpRepository.save(otpEntity);
            throw new RuntimeException("Too many incorrect attempts");
        }

        if (!otpEntity.getOtp().equals(otpCode)) {
            otpRepository.save(otpEntity);
            throw new RuntimeException("Invalid OTP");
        }

        // Success
        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        userRepository.save(user);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        generateAndSendOtp(user);
    }

    public Map<String, Object> loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        boolean isMatch = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword());

        if (!isMatch) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        String token = "mock-jwt-token-for-" + user.getEmail();
        Optional<StoreUser> storeUserOpt = storeUserRepository.findByUser(user);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        if (storeUserOpt.isPresent()) {
            userMap.put("role", "STORE_OWNER");
            userMap.put("isVendor", true);
            userMap.put("storeName", storeUserOpt.get().getStore().getName());
        } else {
            userMap.put("role", "CUSTOMER");
            userMap.put("isVendor", false);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMap);

        return response;
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        generateAndSendOtp(user);
    }

    public void resetPassword(String email, String token, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpEntity.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        if (!otpEntity.getOtp().equals(token)) {
            otpEntity.incrementAttempts();
            otpRepository.save(otpEntity);
            throw new RuntimeException("Invalid OTP");
        }

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String generateRandomOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
