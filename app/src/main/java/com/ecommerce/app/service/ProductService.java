package com.ecommerce.app.service;

import com.ecommerce.app.dto.CreateProductRequest;
import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.Store;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    public List<ProductDto> getProductsByStore(Long storeId) {
        return productRepository.findByStoreId(storeId)
                .stream()
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));
        return new ProductDto(product);
    }

    public ProductDto createProduct(Long storeId, CreateProductRequest request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id " + storeId));

        Product product = new Product();
        product.setStore(store);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setEmoji(request.getEmoji() != null ? request.getEmoji() : "🎁");
        product.setImageUrl(request.getImageUrl());
        product.setCategoryId(request.getCategoryId());

        Product saved = productRepository.save(product);
        return new ProductDto(saved);
    }

    public ProductDto updateProduct(Long productId, CreateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getEmoji() != null) product.setEmoji(request.getEmoji());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getCategoryId() != null) product.setCategoryId(request.getCategoryId());

        Product saved = productRepository.save(product);
        return new ProductDto(saved);
    }

    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));
        productRepository.delete(product);
    }
}
