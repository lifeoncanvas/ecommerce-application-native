-- 1. Reset database tables safely
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_activities;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS store_users;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS email_verification_otps;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Create tables matching Spring Boot JPA entities

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    email_verified TINYINT(1) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_email VARCHAR(150),
    business_phone VARCHAR(20),
    business_address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPROVED',
    verified TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    category VARCHAR(100),
    rating DOUBLE DEFAULT 4.5,
    address VARCHAR(255),
    phone VARCHAR(50),
    active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Store Users relation table
CREATE TABLE IF NOT EXISTS store_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) DEFAULT 'OWNER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT,
    vendor_id BIGINT,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    old_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    emoji VARCHAR(20) DEFAULT '🎁',
    image_url VARCHAR(512),
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Product Activities audit table
CREATE TABLE IF NOT EXISTS product_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255),
    action_type VARCHAR(100),
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Verification OTPs table
CREATE TABLE IF NOT EXISTS email_verification_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified TINYINT(1) DEFAULT 0,
    attempts INT DEFAULT 0,
    otp_type VARCHAR(50) DEFAULT 'REGISTRATION',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Seed Users
REPLACE INTO users (id, email, password, name, role, email_verified, status, created_at) VALUES
(1, 'nike@store.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Nike Store Manager', 'SELLER', 1, 'ACTIVE', NOW()),
(2, 'jazari@vendor.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Jazari Restaurant Owner', 'SELLER', 1, 'ACTIVE', NOW()),
(3, 'apple@store.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Apple Store Manager', 'SELLER', 1, 'ACTIVE', NOW()),
(4, 'healingschool.intl.offices@gmail.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Healing School Admin', 'ADMIN', 1, 'ACTIVE', NOW()),
(5, 'customer@gmail.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Sarah Smith', 'CUSTOMER', 1, 'ACTIVE', NOW()),
(6, 'buyer@gmail.com', '$2a$10$wN1Q1.0T8Qj6x7Z5f.N6uOSbW/M6RkZ2p.eK5o7Q/V0VnZ5f.N6uO', 'Alex Johnson', 'CUSTOMER', 1, 'ACTIVE', NOW());

-- 4. Seed Vendors
REPLACE INTO vendors (id, user_id, business_name, business_email, business_phone, status, verified, created_at) VALUES
(1, 1, 'Nike Official Vendor', 'nike@store.com', '+1-800-555-0199', 'APPROVED', 1, NOW()),
(2, 2, 'Jazari Food Vendor', 'jazari@vendor.com', '+1-800-555-0211', 'APPROVED', 1, NOW()),
(3, 3, 'Apple Official Vendor', 'apple@store.com', '+1-800-555-0300', 'APPROVED', 1, NOW());

-- 5. Seed Stores
REPLACE INTO stores (id, name, slug, description, logo_url, category, rating, address, phone, active, created_at, updated_at) VALUES
(1, 'Nike Store', 'nike-store', 'Official Nike footwear and activewear flagship store', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Fashion & Apparel', 4.8, '102 Sports Boulevard', '+1-800-555-0199', 1, NOW(), NOW()),
(2, 'Jazari Restaurant', 'jazari-restaurant', 'Authentic gourmet dining & meal platters', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Restaurant & Food', 4.7, '45 Gourmet Way', '+1-800-555-0211', 1, NOW(), NOW()),
(3, 'Apple Official Store', 'apple-store', 'Premium electronics, iPhones, and MacBooks', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Electronics', 4.9, '1 Apple Park Way', '+1-800-555-0300', 1, NOW(), NOW());

-- 6. Link Store Owners
REPLACE INTO store_users (id, store_id, user_id, role, created_at) VALUES
(1, 1, 1, 'OWNER', NOW()),
(2, 2, 2, 'OWNER', NOW()),
(3, 3, 3, 'OWNER', NOW());

-- 7. Seed Products (vendor_id references valid vendors 1, 2, 3)
REPLACE INTO products (id, store_id, vendor_id, category_id, name, description, price, discount_price, old_price, stock_quantity, emoji, image_url, active, featured, created_at, updated_at) VALUES
(1, 2, 2, 1, 'Jazari Gourmet Suya Platter', 'Chef signature grilled Suya beef platter served with fresh sliced onions, tomatoes, and spicy yaji pepper.', 180.00, 150.00, 220.00, 100, '🍛', '/images/categories/cat_1.jpg', 1, 1, NOW(), NOW()),
(2, 2, 2, 1, 'Crispy Akara & French Fries', 'Hot bean fritters (Akara) fried to perfect golden crisp, paired with home-cut potato fries.', 80.00, 65.00, 100.00, 80, '🍟', '/images/banners/banner3.jpg', 1, 1, NOW(), NOW()),
(3, 1, 1, 2, 'Nike Performance Track Jacket', 'Comfortable zip-up athletic training track jacket with Dri-FIT moisture-wicking technology.', 280.00, 240.00, 450.00, 50, '🧥', '/images/products/product_4.jpg', 1, 1, NOW(), NOW()),
(4, 3, 3, 7, 'Omnia Horizon Smart Tablet 11"', 'Sleek 11-inch screen tablet with titanium cover, active pencil support and 120Hz display.', 640.00, 580.00, 800.00, 20, '💻', '/images/vendors/vendor_1.jpg', 1, 1, NOW(), NOW());

-- 8. Seed Product Activities Audit Log
REPLACE INTO product_activities (id, store_id, product_id, product_name, action_type, details, timestamp) VALUES
(1, 1, 3, 'Nike Performance Track Jacket', 'Price Updated', 'Price changed $280 → $240', NOW()),
(2, 2, 1, 'Jazari Gourmet Suya Platter', 'Product Added', 'New product listing added to catalog', NOW());

-- 9. Clean up any orphaned vendor_id values on existing database
SET FOREIGN_KEY_CHECKS = 0;
UPDATE products SET vendor_id = NULL WHERE vendor_id IS NOT NULL AND vendor_id NOT IN (SELECT id FROM vendors);
SET FOREIGN_KEY_CHECKS = 1;
