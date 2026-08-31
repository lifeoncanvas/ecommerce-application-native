package com.ecommerce.app.repository;

import com.ecommerce.app.model.ProductActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductActivityRepository extends JpaRepository<ProductActivity, Long> {
    List<ProductActivity> findByStoreIdOrderByTimestampDesc(Long storeId);
}
