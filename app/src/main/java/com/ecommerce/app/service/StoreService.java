package com.ecommerce.app.service;

import com.ecommerce.app.dto.StoreDto;
import com.ecommerce.app.model.Store;
import com.ecommerce.app.model.StoreUser;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.StoreRepository;
import com.ecommerce.app.repository.StoreUserRepository;
import com.ecommerce.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private StoreUserRepository storeUserRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StoreDto> getAllActiveStores() {
        return storeRepository.findByActiveTrue()
                .stream()
                .map(StoreDto::new)
                .collect(Collectors.toList());
    }

    public StoreDto getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id " + storeId));
        return new StoreDto(store);
    }

    public StoreDto updateStore(Long storeId, StoreDto updateDto) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id " + storeId));

        if (updateDto.getName() != null) store.setName(updateDto.getName());
        if (updateDto.getDescription() != null) store.setDescription(updateDto.getDescription());
        if (updateDto.getLogoUrl() != null) store.setLogoUrl(updateDto.getLogoUrl());
        if (updateDto.getCategory() != null) store.setCategory(updateDto.getCategory());
        if (updateDto.getAddress() != null) store.setAddress(updateDto.getAddress());
        if (updateDto.getPhone() != null) store.setPhone(updateDto.getPhone());

        Store saved = storeRepository.save(store);
        return new StoreDto(saved);
    }

    public StoreDto getStoreForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email " + userEmail));

        StoreUser storeUser = storeUserRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("User is not associated with any store"));

        return new StoreDto(storeUser.getStore());
    }

    public Store getStoreEntityById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id " + storeId));
    }
}
