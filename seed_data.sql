-- 1. Reset tables safely to align column schema
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS store_users;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Create tables matching Spring Boot JPA entities
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    email_verified TINYINT(1) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE stores (
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

CREATE TABLE store_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) DEFAULT 'OWNER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    image_url VARCHAR(255),
    description TEXT,
    active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT,
    vendor_id BIGINT,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    emoji VARCHAR(20),
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
);

-- 3. Insert Categories (Using INSERT IGNORE to prevent duplicate primary key errors)
INSERT IGNORE INTO categories (id, name, slug, image_url, description, active, sort_order, created_at, updated_at) VALUES
(1, 'Restaurant & Food', 'restaurant-food', '/images/categories/restaurant.jpg', 'Restaurants and Eateries', 1, 1, NOW(), NOW()),
(2, 'Fashion & Clothing', 'fashion-clothing', '/images/categories/fashion.jpg', 'Clothing and Boutiques', 1, 2, NOW(), NOW()),
(3, 'Household & Lifestyle', 'household-lifestyle', '/images/categories/household.jpg', 'Household accessories and smart home', 1, 3, NOW(), NOW()),
(4, 'Groceries', 'groceries', '/images/categories/groceries.jpg', 'Daily needs and groceries', 1, 4, NOW(), NOW()),
(5, 'Salon & Beauty', 'salon-beauty', '/images/categories/salon.jpg', 'Hair, make-up, and beauty', 1, 5, NOW(), NOW()),
(6, 'Entertainment', 'entertainment', '/images/categories/entertainment.jpg', 'Games, arcade, and cinema', 1, 6, NOW(), NOW()),
(7, 'Services', 'services', '/images/categories/services.jpg', 'Dry cleaning, car wash, and eye care', 1, 7, NOW(), NOW()),
(8, 'Electronics', 'electronics', '/images/categories/electronics.jpg', 'Mobile phones and gadgets', 1, 8, NOW(), NOW()),
(9, 'Health & Pharmaceutics', 'health-pharmaceutics', '/images/categories/health.jpg', 'Pharmacy and healthcare', 1, 9, NOW(), NOW()),
(10, 'Banking', 'banking', '/images/categories/banking.jpg', 'Financial services', 1, 10, NOW(), NOW());

-- 4. Insert Users (role STORE_OWNER / VENDOR)
INSERT IGNORE INTO users (id, email, password, name, role, email_verified, status, created_at) VALUES
(1, 'nike@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Nike Store Manager', 'STORE_OWNER', 1, 'ACTIVE', NOW()),
(2, 'jazari@vendor.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Jazari Restaurant Owner', 'STORE_OWNER', 1, 'ACTIVE', NOW()),
(3, 'apple@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Apple Store Manager', 'STORE_OWNER', 1, 'ACTIVE', NOW());

-- 5. Insert Stores
INSERT IGNORE INTO stores (id, name, slug, description, logo_url, category, rating, address, phone, active, created_at, updated_at) VALUES
(1, 'Nike Store', 'nike-store', 'Official Nike footwear and activewear flagship store', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Fashion & Apparel', 4.8, '102 Sports Boulevard', '+1-800-555-0199', 1, NOW(), NOW()),
(2, 'Jazari Restaurant', 'jazari-restaurant', 'Authentic gourmet dining & meal platters', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Restaurant & Food', 4.7, '45 Gourmet Way', '+1-800-555-0211', 1, NOW(), NOW()),
(3, 'Apple Official Store', 'apple-store', 'Premium electronics, iPhones, and MacBooks', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Electronics', 4.9, '1 Apple Park Way', '+1-800-555-0300', 1, NOW(), NOW());

-- 6. Link Store Users
INSERT IGNORE INTO store_users (id, store_id, user_id, role, created_at) VALUES
(1, 1, 1, 'OWNER', NOW()),
(2, 2, 2, 'OWNER', NOW()),
(3, 3, 3, 'OWNER', NOW());

-- 7. Insert Products (Tied to Store ID)
INSERT IGNORE INTO products (id, store_id, vendor_id, category_id, name, description, price, stock_quantity, emoji, active, featured, created_at, updated_at) VALUES
(1, 1, 101, 2, 'Air Max 2026', 'Next-gen cushioned running shoes with enhanced mesh upper', 8999.00, 20, '👟', 1, 1, NOW(), NOW()),
(2, 1, 101, 2, 'Nike Dri-FIT T-Shirt', 'Breathable performance training t-shirt', 1499.00, 50, '👕', 1, 1, NOW(), NOW()),
(3, 1, 101, 2, 'Nike Heritage Backpack', 'Durable everyday storage bag with padded shoulder straps', 2499.00, 30, '🎒', 1, 0, NOW(), NOW()),
(4, 2, 102, 1, 'Jazari Special Meal Platter', 'Chef signature gourmet platter with grilled chicken and side salad', 450.00, 100, '🍔', 1, 1, NOW(), NOW()),
(5, 2, 102, 1, 'Fresh Citrus Smoothie', '100% natural cold pressed orange and passionfruit smoothie', 120.00, 80, '🥤', 1, 1, NOW(), NOW()),
(6, 3, 103, 8, 'iPhone 15 Pro Max', 'Titanium design with A17 Pro chip and 48MP camera system', 119900.00, 15, '📱', 1, 1, NOW(), NOW());

