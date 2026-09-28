package com.ecommerce.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:healingschool.intl.offices@gmail.com}")
    private String fromEmail;

    @Value("${app.mail.admin:healingschool.intl.offices@gmail.com}")
    private String adminEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        sendRegistrationOtp(toEmail, "User", otp);
    }

    public void sendRegistrationOtp(String toEmail, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account Registration - Verification Code");
        message.setText("Hello " + (name != null ? name : "User") + ",\n\n"
                + "Thank you for creating an account!\n"
                + "Your email verification OTP code is: " + otp + "\n\n"
                + "This code is valid for 10 minutes. Please enter this code to verify your account.\n\n"
                + "Best regards,\nHealing School Team");

        javaMailSender.send(message);
    }

    public void sendSetPasswordEmail(String toEmail, String name, String otp, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Set Your Password - " + (role != null ? role.toUpperCase() : "Account") + " Portal");
        message.setText("Hello " + (name != null ? name : "User") + ",\n\n"
                + "An account (" + (role != null ? role.toUpperCase() : "USER") + ") has been created for you.\n"
                + "Your password setup OTP / verification code is: " + otp + "\n\n"
                + "Please use this code to set your new password and verify your account.\n"
                + "This code is valid for 10 minutes.\n\n"
                + "Best regards,\nHealing School Team");

        javaMailSender.send(message);
    }

    public void sendForgotPasswordOtp(String toEmail, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset Request - Verification Code");
        message.setText("Hello " + (name != null ? name : "User") + ",\n\n"
                + "We received a request to reset your password.\n"
                + "Your OTP verification code is: " + otp + "\n\n"
                + "This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.\n\n"
                + "Best regards,\nHealing School Team");

        javaMailSender.send(message);
    }

    public void sendLoginOtp(String toEmail, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Login Verification Code");
        message.setText("Hello " + (name != null ? name : "User") + ",\n\n"
                + "Your login verification OTP is: " + otp + "\n\n"
                + "This code is valid for 10 minutes. Please enter this OTP to complete your login.\n\n"
                + "Best regards,\nHealing School Team");

        javaMailSender.send(message);
    }

    public void sendWelcomeEmail(String toEmail, String name, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome - " + (role != null ? role.toUpperCase() : "User") + " Account Active");
        message.setText("Hello " + (name != null ? name : "User") + ",\n\n"
                + "Your " + (role != null ? role.toUpperCase() : "User") + " account has been successfully created and verified!\n\n"
                + "You can now log in to the portal using your credentials.\n\n"
                + "Best regards,\nHealing School Team");

        javaMailSender.send(message);
    }

    public void sendAdminNotification(String subject, String details) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("[Admin Alert] " + subject);
            message.setText("Administrator Alert Notice:\n\n"
                    + details + "\n\n"
                    + "Timestamp: " + java.time.LocalDateTime.now() + "\n\n"
                    + "System Notification,\nHealing School Platform");

            javaMailSender.send(message);
        } catch (Exception e) {
            // Non-blocking log for admin notification fail
            System.err.println("Failed to send admin notification email: " + e.getMessage());
        }
    }
}
