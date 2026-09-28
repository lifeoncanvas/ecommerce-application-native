package com.ecommerce.app.service;

import com.ecommerce.app.dto.RegisterRequest;
import com.ecommerce.app.dto.LoginRequest;
import com.ecommerce.app.dto.SetPasswordRequest;
import com.ecommerce.app.model.EmailVerificationOtp;
import com.ecommerce.app.model.User;
import com.ecommerce.app.model.StoreUser;
import com.ecommerce.app.repository.EmailVerificationOtpRepository;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.repository.StoreUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.mail.admin:healingschool.intl.offices@gmail.com}")
    private String adminEmail;

    // --- Account Creation & Registration Flow (User, Seller, Admin) ---

    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        String targetRole = (request.getRole() != null && !request.getRole().trim().isEmpty()) 
                ? request.getRole().toUpperCase() : "CUSTOMER";

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "TempPass_" + generateRandomOtp();
        }

        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(rawPassword), targetRole);
        if (adminEmail.equalsIgnoreCase(request.getEmail())) {
            user.setRole("ADMIN");
        }
        userRepository.save(user);

        // Generate Set Password / Registration OTP
        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "SET_PASSWORD");
        otpRepository.save(otp);

        // Send email to set password / verify account
        emailService.sendSetPasswordEmail(user.getEmail(), user.getName(), otpCode, user.getRole());

        // Notify Admin about new account creation
        emailService.sendAdminNotification(
                "New Account Registered (" + user.getRole() + ")",
                "Account Details:\nName: " + user.getName() + "\nEmail: " + user.getEmail() + "\nRole: " + user.getRole()
        );
    }

    public void createAccountByAdmin(String name, String email, String role, String initialPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }

        String assignedRole = (role != null && !role.trim().isEmpty()) ? role.toUpperCase() : "CUSTOMER";
        String passwordToUse = (initialPassword != null && !initialPassword.trim().isEmpty()) 
                ? initialPassword : "TempPassword_" + generateRandomOtp();

        User user = new User(name, email, passwordEncoder.encode(passwordToUse), assignedRole);
        userRepository.save(user);

        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "SET_PASSWORD");
        otpRepository.save(otp);

        emailService.sendSetPasswordEmail(user.getEmail(), user.getName(), otpCode, user.getRole());
        emailService.sendAdminNotification(
                "Admin Created Account (" + user.getRole() + ")",
                "Admin created account for:\nName: " + name + "\nEmail: " + email + "\nRole: " + assignedRole
        );
    }

    public void generateAndSendRegistrationOtp(User user) {
        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "REGISTRATION");
        otpRepository.save(otp);

        emailService.sendRegistrationOtp(user.getEmail(), user.getName(), otpCode);
    }

    public void generateAndSendOtp(User user) {
        generateAndSendRegistrationOtp(user);
    }

    // --- Set Password Flow ---

    public void setPassword(SetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "SET_PASSWORD")
                .orElseGet(() -> otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "REGISTRATION")
                .orElseGet(() -> otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() -> new RuntimeException("No valid OTP or token found"))));

        validateOtp(otpEntity, request.getToken());

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        // Send welcome email after setting password
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getRole());
        } catch (Exception e) {
            // non-blocking
        }
    }

    public void verifyEmail(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "REGISTRATION")
                .orElseGet(() -> otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "SET_PASSWORD")
                .orElseGet(() -> otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() -> new RuntimeException("OTP not found"))));

        validateOtp(otpEntity, otpCode);

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getRole());
        } catch (Exception e) {
            // ignore
        }
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "SET_PASSWORD");
        otpRepository.save(otp);

        emailService.sendSetPasswordEmail(user.getEmail(), user.getName(), otpCode, user.getRole());
    }

    // --- Forgot Password Flow ---

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "FORGOT_PASSWORD");
        otpRepository.save(otp);

        emailService.sendForgotPasswordOtp(user.getEmail(), user.getName(), otpCode);
    }

    public void verifyForgotPasswordOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "FORGOT_PASSWORD")
                .orElseGet(() -> otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() -> new RuntimeException("OTP not found")));

        validateOtp(otpEntity, otpCode);
    }

    public void resetPassword(String email, String token, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "FORGOT_PASSWORD")
                .orElseGet(() -> otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() -> new RuntimeException("OTP not found")));

        validateOtp(otpEntity, token);

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // --- Login & Login OTP Flow ---

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
            user.setStatus("ACTIVE");
            userRepository.save(user);
        }

        return createAuthResponse(user);
    }

    public void sendLoginOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String otpCode = generateRandomOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerificationOtp otp = new EmailVerificationOtp(user, otpCode, expiresAt, "LOGIN");
        otpRepository.save(otp);

        emailService.sendLoginOtp(user.getEmail(), user.getName(), otpCode);
    }

    public Map<String, Object> loginWithOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationOtp otpEntity = otpRepository.findTopByUserAndOtpTypeOrderByCreatedAtDesc(user, "LOGIN")
                .orElseGet(() -> otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() -> new RuntimeException("OTP not found")));

        validateOtp(otpEntity, otpCode);

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        }

        return createAuthResponse(user);
    }

    // --- Helper Methods ---

    private void validateOtp(EmailVerificationOtp otpEntity, String inputOtp) {
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

        if (!otpEntity.getOtp().equals(inputOtp)) {
            otpRepository.save(otpEntity);
            throw new RuntimeException("Invalid OTP");
        }
    }

    private Map<String, Object> createAuthResponse(User user) {
        String token = "mock-jwt-token-for-" + user.getEmail();
        Optional<StoreUser> storeUserOpt = storeUserRepository.findByUser(user);

        String effectiveRole = user.getRole();
        if (adminEmail.equalsIgnoreCase(user.getEmail())) {
            effectiveRole = "ADMIN";
        } else if (storeUserOpt.isPresent() || "SELLER".equalsIgnoreCase(effectiveRole)) {
            effectiveRole = "SELLER";
        } else if (effectiveRole == null || effectiveRole.isEmpty()) {
            effectiveRole = "CUSTOMER";
        }

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", effectiveRole);
        userMap.put("isVendor", "SELLER".equalsIgnoreCase(effectiveRole) || storeUserOpt.isPresent());
        if (storeUserOpt.isPresent()) {
            userMap.put("storeName", storeUserOpt.get().getStore().getName());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMap);

        return response;
    }

    public Map<String, Object> loginOrRegisterSocialUser(String email, String name, String provider) {
        String targetEmail = (email != null && !email.trim().isEmpty()) 
                ? email.toLowerCase().trim() : provider.toLowerCase() + "_user@gmail.com";
        String targetName = (name != null && !name.trim().isEmpty()) 
                ? name : provider.substring(0, 1).toUpperCase() + provider.substring(1) + " User";

        User user = userRepository.findByEmail(targetEmail).orElseGet(() -> {
            User newUser = new User(targetName, targetEmail, passwordEncoder.encode("SocialPass_" + generateRandomOtp()), "CUSTOMER");
            newUser.setEmailVerified(true);
            newUser.setStatus("ACTIVE");
            User saved = userRepository.save(newUser);

            emailService.sendAdminNotification(
                    "New Social Account Registered (" + provider.toUpperCase() + ")",
                    "Social user registered in database:\nName: " + saved.getName() + "\nEmail: " + saved.getEmail()
            );
            return saved;
        });

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        }

        return createAuthResponse(user);
    }

    private String generateRandomOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
