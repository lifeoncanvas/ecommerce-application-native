package com.ecommerce.app.repository;

import com.ecommerce.app.model.EmailVerificationOtp;
import com.ecommerce.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {
    Optional<EmailVerificationOtp> findByUserAndVerifiedFalseOrderByIdDesc(User user);
    Optional<EmailVerificationOtp> findTopByUserOrderByCreatedAtDesc(User user);
}
