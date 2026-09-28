-- PostgreSQL / Neon DB Schema and Seed Script

-- 1. Table schema definitions

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    category VARCHAR(100),
    rating DOUBLE PRECISION DEFAULT 4.5,
    address VARCHAR(255),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_users (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'OWNER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
    vendor_id BIGINT,
    category_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    old_price NUMERIC(10, 2),
    stock_quantity INT DEFAULT 0,
    emoji VARCHAR(20) DEFAULT '🎁',
    image_url VARCHAR(512),
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_activities (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255),
    action_type VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verification_otps (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    otp_type VARCHAR(50) DEFAULT 'REGISTRATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clear existing data safely
TRUNCATE TABLE product_activities CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE store_users CASCADE;
TRUNCATE TABLE stores CASCADE;
TRUNCATE TABLE email_verification_otps CASCADE;
TRUNCATE TABLE users CASCADE;

-- 3. Insert Users (role SELLER / CUSTOMER / ADMIN)
INSERT INTO users (id, email, password, name, role, email_verified, status, created_at) VALUES
(1, 'nike@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Nike Store Manager', 'SELLER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(2, 'jazari@vendor.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Jazari Restaurant Owner', 'SELLER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(3, 'apple@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Apple Store Manager', 'SELLER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(4, 'healingschool.intl.offices@gmail.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Healing School Admin', 'ADMIN', true, 'ACTIVE', CURRENT_TIMESTAMP),
(5, 'customer@gmail.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Sarah Smith', 'CUSTOMER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(6, 'buyer@gmail.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Alex Johnson', 'CUSTOMER', true, 'ACTIVE', CURRENT_TIMESTAMP);

-- 4. Insert Stores
INSERT INTO stores (id, name, slug, description, logo_url, category, rating, address, phone, active, created_at, updated_at) VALUES
(1, 'Nike Store', 'nike-store', 'Official Nike footwear and activewear flagship store', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Fashion & Apparel', 4.8, '102 Sports Boulevard', '+1-800-555-0199', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Jazari Restaurant', 'jazari-restaurant', 'Authentic gourmet dining & meal platters', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Restaurant & Food', 4.7, '45 Gourmet Way', '+1-800-555-0211', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Apple Official Store', 'apple-store', 'Premium electronics, iPhones, and MacBooks', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Electronics', 4.9, '1 Apple Park Way', '+1-800-555-0300', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Link Store Users
INSERT INTO store_users (id, store_id, user_id, role, created_at) VALUES
(1, 1, 1, 'OWNER', CURRENT_TIMESTAMP),
(2, 2, 2, 'OWNER', CURRENT_TIMESTAMP),
(3, 3, 3, 'OWNER', CURRENT_TIMESTAMP);

-- 6. Insert Products
INSERT INTO products (id, store_id, vendor_id, category_id, name, description, price, discount_price, old_price, stock_quantity, emoji, image_url, active, featured, created_at, updated_at) VALUES
(1, 2, 101, 1, 'Jazari Gourmet Suya Platter', 'Chef signature grilled Suya beef platter served with fresh sliced onions, tomatoes, and spicy yaji pepper.', 180.00, 150.00, 220.00, 100, '🍛', '/images/categories/cat_1.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 102, 1, 'Crispy Akara & French Fries', 'Hot bean fritters (Akara) fried to perfect golden crisp, paired with home-cut potato fries.', 80.00, 65.00, 100.00, 80, '🍟', '/images/banners/banner3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 103, 2, 'Nike Performance Track Jacket', 'Comfortable zip-up athletic training track jacket with Dri-FIT moisture-wicking technology.', 280.00, 240.00, 450.00, 50, '🧥', '/images/products/product_4.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 3, 111, 7, 'Omnia Horizon Smart Tablet 11"', 'Sleek 11-inch screen tablet with titanium cover, active pencil support and 120Hz display.', 640.00, 580.00, 800.00, 20, '💻', '/images/vendors/vendor_1.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
