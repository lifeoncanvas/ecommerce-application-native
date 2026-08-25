package com.ecommerce.app.repository;

import com.ecommerce.app.model.StoreUser;
import com.ecommerce.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreUserRepository extends JpaRepository<StoreUser, Long> {
    Optional<StoreUser> findByUser(User user);
    Optional<StoreUser> findByUserId(Long userId);
    List<StoreUser> findByStoreId(Long storeId);
}
