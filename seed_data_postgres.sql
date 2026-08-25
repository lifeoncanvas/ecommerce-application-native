-- PostgreSQL / Neon DB Schema and Seed Script

-- 1. Table schema definitions
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
    stock_quantity INT DEFAULT 0,
    emoji VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clear existing data
TRUNCATE TABLE product_images CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE store_users CASCADE;
TRUNCATE TABLE stores CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, image_url, description, active, sort_order, created_at, updated_at) VALUES
(1, 'Restaurant & Food', 'restaurant-food', '/images/categories/restaurant.jpg', 'Restaurants and Eateries', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Fashion & Clothing', 'fashion-clothing', '/images/categories/fashion.jpg', 'Clothing and Boutiques', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Household & Lifestyle', 'household-lifestyle', '/images/categories/household.jpg', 'Household accessories and smart home', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Groceries', 'groceries', '/images/categories/groceries.jpg', 'Daily needs and groceries', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Salon & Beauty', 'salon-beauty', '/images/categories/salon.jpg', 'Hair, make-up, and beauty', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Entertainment', 'entertainment', '/images/categories/entertainment.jpg', 'Games, arcade, and cinema', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Services', 'services', '/images/categories/services.jpg', 'Dry cleaning, car wash, and eye care', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Electronics', 'electronics', '/images/categories/electronics.jpg', 'Mobile phones and gadgets', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Health & Pharmaceutics', 'health-pharmaceutics', '/images/categories/health.jpg', 'Pharmacy and healthcare', true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'Banking', 'banking', '/images/categories/banking.jpg', 'Financial services', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Insert Users (role STORE_OWNER / VENDOR)
INSERT INTO users (id, email, password, name, role, email_verified, status, created_at) VALUES
(1, 'nike@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Nike Store Manager', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(2, 'jazari@vendor.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Jazari Restaurant Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(3, 'apple@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Apple Store Manager', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP);

-- 5. Insert Stores
INSERT INTO stores (id, name, slug, description, logo_url, category, rating, address, phone, active, created_at, updated_at) VALUES
(1, 'Nike Store', 'nike-store', 'Official Nike footwear and activewear flagship store', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Fashion & Apparel', 4.8, '102 Sports Boulevard', '+1-800-555-0199', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Jazari Restaurant', 'jazari-restaurant', 'Authentic gourmet dining & meal platters', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Restaurant & Food', 4.7, '45 Gourmet Way', '+1-800-555-0211', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Apple Official Store', 'apple-store', 'Premium electronics, iPhones, and MacBooks', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Electronics', 4.9, '1 Apple Park Way', '+1-800-555-0300', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Link Store Users
INSERT INTO store_users (id, store_id, user_id, role, created_at) VALUES
(1, 1, 1, 'OWNER', CURRENT_TIMESTAMP),
(2, 2, 2, 'OWNER', CURRENT_TIMESTAMP),
(3, 3, 3, 'OWNER', CURRENT_TIMESTAMP);

-- 7. Insert Products (Tied to Store ID)
INSERT INTO products (id, store_id, vendor_id, category_id, name, description, price, stock_quantity, emoji, active, featured, created_at, updated_at) VALUES
(1, 1, 101, 2, 'Air Max 2026', 'Next-gen cushioned running shoes with enhanced mesh upper', 8999.00, 20, '👟', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 101, 2, 'Nike Dri-FIT T-Shirt', 'Breathable performance training t-shirt', 1499.00, 50, '👕', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 101, 2, 'Nike Heritage Backpack', 'Durable everyday storage bag with padded shoulder straps', 2499.00, 30, '🎒', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 102, 1, 'Jazari Special Meal Platter', 'Chef signature gourmet platter with grilled chicken and side salad', 450.00, 100, '🍔', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 102, 1, 'Fresh Citrus Smoothie', '100% natural cold pressed orange and passionfruit smoothie', 120.00, 80, '🥤', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 3, 103, 8, 'iPhone 15 Pro Max', 'Titanium design with A17 Pro chip and 48MP camera system', 119900.00, 15, '📱', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
