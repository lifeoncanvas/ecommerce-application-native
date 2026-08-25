package com.ecommerce.app.service;

import com.ecommerce.app.dto.CreateProductRequest;
import com.ecommerce.app.dto.ProductDto;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.ProductActivity;
import com.ecommerce.app.model.Store;
import com.ecommerce.app.repository.ProductActivityRepository;
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

    @Autowired
    private ProductActivityRepository productActivityRepository;

    @Autowired
    private StoreService storeService;

    public void validateProductOwnership(Product product, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return;
        try {
            var userStore = storeService.getStoreForUser(userEmail);
            if (product.getStore() != null && userStore != null && !product.getStore().getId().equals(userStore.getId())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN,
                        "Access Denied: You can only manage products belonging to your store"
                );
            }
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            // Store lookup fallback
        }
    }

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

        // Audit Log
        productActivityRepository.save(new ProductActivity(
                storeId,
                saved.getId(),
                saved.getName(),
                "New product added",
                "Product created with price ₦" + saved.getPrice()
        ));

        return new ProductDto(saved);
    }

    public ProductDto updateProduct(Long productId, CreateProductRequest request, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));

        validateProductOwnership(product, userEmail);

        String oldPriceStr = product.getPrice() != null ? "₦" + product.getPrice() : "N/A";

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getEmoji() != null) product.setEmoji(request.getEmoji());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getCategoryId() != null) product.setCategoryId(request.getCategoryId());

        Product saved = productRepository.save(product);

        // Audit Log
        Long storeId = saved.getStore() != null ? saved.getStore().getId() : 1L;
        String newPriceStr = saved.getPrice() != null ? "₦" + saved.getPrice() : "N/A";
        String details = oldPriceStr.equals(newPriceStr) ? "Product details updated" : "Price changed " + oldPriceStr + " → " + newPriceStr;

        productActivityRepository.save(new ProductActivity(
                storeId,
                saved.getId(),
                saved.getName(),
                oldPriceStr.equals(newPriceStr) ? "Product Details Updated" : "Price Updated",
                details
        ));

        return new ProductDto(saved);
    }

    public ProductDto toggleProductStatus(Long productId, boolean active, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));

        validateProductOwnership(product, userEmail);

        product.setActive(active);
        Product saved = productRepository.save(product);

        Long storeId = saved.getStore() != null ? saved.getStore().getId() : 1L;
        String actionType = active ? "Product Activated" : "Product Deactivated";
        String details = active ? "Product marked as Active and visible in Customer App" : "Product marked as Inactive (Hidden from Customer App)";

        productActivityRepository.save(new ProductActivity(
                storeId,
                saved.getId(),
                saved.getName(),
                actionType,
                details
        ));

        return new ProductDto(saved);
    }

    public List<ProductActivity> getStoreActivities(Long storeId) {
        return productActivityRepository.findByStoreIdOrderByTimestampDesc(storeId);
    }

    public void deleteProduct(Long productId, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));

        validateProductOwnership(product, userEmail);

        Long storeId = product.getStore() != null ? product.getStore().getId() : 1L;
        productActivityRepository.save(new ProductActivity(
                storeId,
                product.getId(),
                product.getName(),
                "Product Removed",
                "Product listing removed from database"
        ));

        productRepository.delete(product);
    }
}
