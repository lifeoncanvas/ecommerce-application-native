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
    discount_price NUMERIC(10, 2),
    old_price NUMERIC(10, 2),
    stock_quantity INT DEFAULT 0,
    emoji VARCHAR(20),
    image_url VARCHAR(512),
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
(3, 'apple@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Apple Store Manager', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(7, 'homeworld@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Home World Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(8, 'kalaya@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Kalaya Beauty Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(9, 'kingscarwash@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Kings Carwash Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(10, 'carlos@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Carlos Pharmacy Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP),
(11, 'dixons@store.com', '$2a$10$7R9j0Q8Xz.z5a4v3u2w1e.e8d7c6b5a4v3u2w1e8d7c6b5a4v3u2w', 'Dixons Foods Owner', 'STORE_OWNER', true, 'ACTIVE', CURRENT_TIMESTAMP);

-- 5. Insert Stores
INSERT INTO stores (id, name, slug, description, logo_url, category, rating, address, phone, active, created_at, updated_at) VALUES
(1, 'Nike Store', 'nike-store', 'Official Nike footwear and activewear flagship store', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Fashion & Apparel', 4.8, '102 Sports Boulevard', '+1-800-555-0199', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Jazari Restaurant', 'jazari-restaurant', 'Authentic gourmet dining & meal platters', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Restaurant & Food', 4.7, '45 Gourmet Way', '+1-800-555-0211', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Apple Official Store', 'apple-store', 'Premium electronics, iPhones, and MacBooks', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Electronics', 4.9, '1 Apple Park Way', '+1-800-555-0300', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Home World', 'home-world', 'Premium ceramic cookware and home styling sets', 'https://images.unsplash.com/photo-1616046229478-9901c5536a45', 'Household & Lifestyle', 4.7, '88 Decor Street', '+1-800-555-0444', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Kalaya Beauty', 'kalaya-beauty', 'Cosmetics, lip tints, and facial palettes', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', 'Salon & Beauty', 4.8, '10 Beverly Road', '+1-800-555-0555', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Kings Carwash & Entertainment', 'kings-carwash', 'Premium car detailing and fun activities', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f', 'Entertainment & Services', 4.6, '22 Service Lane', '+1-800-555-0666', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Carlos Pharmaceutics & Eye Clinic', 'carlos-pharmacy', 'Eye care, vitamins, and healthcare essentials', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 'Health & Pharmaceutics', 4.5, '55 Wellness Way', '+1-800-555-0777', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Dixons Foods', 'dixons-foods', 'Daily fresh foods, noodles and spices', 'https://images.unsplash.com/photo-1542838132-92c53300491e', 'Groceries', 4.4, '15 Essentials Blvd', '+1-800-555-0888', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Link Store Users
INSERT INTO store_users (id, store_id, user_id, role, created_at) VALUES
(1, 1, 1, 'OWNER', CURRENT_TIMESTAMP),
(2, 2, 2, 'OWNER', CURRENT_TIMESTAMP),
(3, 3, 3, 'OWNER', CURRENT_TIMESTAMP),
(4, 4, 7, 'OWNER', CURRENT_TIMESTAMP),
(5, 5, 8, 'OWNER', CURRENT_TIMESTAMP),
(6, 6, 9, 'OWNER', CURRENT_TIMESTAMP),
(7, 7, 10, 'OWNER', CURRENT_TIMESTAMP),
(8, 8, 11, 'OWNER', CURRENT_TIMESTAMP);

-- 7. Insert Products (At least 5 products per category, tied to Store ID)
INSERT INTO products (id, store_id, vendor_id, category_id, name, description, price, discount_price, old_price, stock_quantity, emoji, image_url, active, featured, created_at, updated_at) VALUES

-- Category 1: Restaurant & Food
(1, 2, 101, 1, 'Jazari Gourmet Suya Platter', 'Chef signature grilled Suya beef platter served with fresh sliced onions, tomatoes, and spicy yaji pepper.', 180.00, 150.00, 220.00, 100, '🍛', '/images/categories/cat_1.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 102, 1, 'Crispy Akara & French Fries', 'Hot bean fritters (Akara) fried to perfect golden crisp, paired with home-cut potato fries.', 80.00, 65.00, 100.00, 80, '🍟', '/images/banners/banner3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 117, 1, 'Red Velvet Celebration Cake', 'Rich, moist double-layer red velvet cake topped with smooth cream cheese frosting.', 350.00, 300.00, 450.00, 15, '🎂', '/images/vendors/vendor_3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 117, 1, 'Fresh Butter Croissant (4 Pack)', 'Flaky, buttery French pastries baked fresh daily, perfect for breakfast.', 65.00, 50.00, 80.00, 40, '🥐', '/images/categories/food.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 119, 1, 'Bistro Grilled Beef Burger', 'Flame-grilled prime beef patty on brioche bun with fresh lettuce, tomatoes, cheese, and side fries.', 130.00, 110.00, 160.00, 50, '🍔', '/images/banners/banner3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 2: Fashion & Clothing
(6, 1, 112, 2, 'Classic Bridal A-Line Gown', 'Stunning off-shoulder white lace A-line bridal gown with a chapel length train.', 750.00, 680.00, 900.00, 5, '👰', '/images/products/product_2.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 1, 103, 2, 'Nike Performance Track Jacket', 'Comfortable zip-up athletic training track jacket with Dri-FIT moisture-wicking technology.', 280.00, 240.00, 450.00, 50, '🧥', '/images/products/product_4.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 1, 103, 2, 'Pleated Sunset Blazer & Trouser', 'Chic double-breasted sunset orange blazer set with high-waisted pleated trousers.', 240.00, 200.00, 480.00, 30, '👔', '/images/vendors/vendor_7.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 1, 112, 2, 'Kiddies Cotton Dungarees Set', 'Comfy cotton dungarees paired with a soft striped inner tee for kids.', 95.00, 80.00, 150.00, 20, '👶', '/images/products/product_5.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 1, 103, 2, 'Premium Velvet Dinner Suit', 'Tailored slim-fit dark blue velvet dinner suit jacket with silk lapels.', 180.00, 150.00, 240.00, 10, '👔', '/images/details/hero_1.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 3: Household & Lifestyle
(11, 4, 104, 3, 'Home World Ceramic Tea Set', 'Elegant porcelain teapot with 4 matching cups, featuring a smooth wooden handle and matching tray.', 85.00, 75.00, 130.00, 25, '🍳', '/images/vendors/vendor_4.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 4, 109, 3, 'Minimalist Aromatherapy Humidifier', 'Ultrasonic cool mist humidifier with soft LED ambient strip lights for home relaxation.', 18.00, 15.00, 30.00, 100, '🕯️', '/images/categories/cat_5.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 4, 104, 3, 'Pink Tulip Ceramic Candle Jar', 'Handcrafted soy wax candle housed in a beautiful pink tulip ceramic jar with essential oil scents.', 290.00, 250.00, 580.00, 40, '🏺', '/images/banners/banner3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 4, 104, 3, 'Luxury Cotton Bedding Sheet Set', 'Ultra-soft 800 thread count cotton sheet set including flat sheet and pillow cases.', 75.00, 60.00, 120.00, 15, '🛏️', '/images/details/hero_1.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 4, 109, 3, 'Chef Kitchen Knife Block Set', 'High-carbon German steel kitchen knives set housed in a robust dark oak block.', 85.00, 70.00, 150.00, 20, '🔪', '/images/details/card_1.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 4: Groceries
(16, 8, 123, 4, 'Dixons Chicken Noodles Box', 'Instant chicken flavor noodles, family sized box containing 40 individual packs.', 14.50, 12.00, 18.00, 200, '🍜', '/images/vendors/vendor_3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 8, 123, 4, 'Dixons Seasoning Cubes (100 Pack)', 'Chicken flavored seasoning cubes perfect for enhancing local soups, stews, and jollof rice.', 3.00, 2.50, 4.00, 500, '🧂', '/images/categories/groceries.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 8, 105, 4, 'Fresh Sunshine Citrus Basket Crate', 'Fresh rustic basket filled with handpicked organic sweet oranges, grapefruits, and lemons.', 110.00, 90.00, 150.00, 45, '🍊', '/images/categories/cat_3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 8, 123, 4, 'Premium Sunflower Cooking Oil', '100% pure, cholesterol-free double-refined sunflower cooking oil for healthy meals.', 24.00, 20.00, 32.00, 60, '🍶', '/images/categories/cat_3.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 8, 105, 4, 'Organic Farm Fresh Harvest Pantry Bag', 'Pantry bag loaded with local farm-fresh green vegetables, root crops, and organic produce.', 180.00, 150.00, 300.00, 30, '🥬', '/images/categories/groceries.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 5: Salon & Beauty
(21, 5, 115, 5, 'Beautiful Woman Luxury Parfum', 'Intense and delicate floral designer fragrance designed for modern elegant women.', 380.00, 340.00, 1900.00, 10, '🧴', '/images/products/product_1.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 5, 115, 5, 'Signature Red Liquid Lipstick', 'Matte velvet finish highly-pigmented long-lasting red lip color.', 380.00, 340.00, 1900.00, 40, '👄', '/images/products/product_3.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 5, 115, 5, 'Complexion 05 9-Shade Palette', 'Highly-blendable eye shadow palette featuring 9 neutral and warm earth pigments.', 380.00, 340.00, 1900.00, 15, '🎨', '/images/products/product_6.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 5, 115, 5, 'Kalaya Pocket Blush Stick Glow', 'Creamy easy-blend pocket size blush stick for an instant radiant dewy glow.', 240.00, 200.00, 480.00, 50, '💄', '/images/vendors/vendor_2.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 5, 115, 5, 'Kalaya Premium Lipstick Set (3-Piece)', 'Limited edition gift box containing three classic matte long-wear lipstick shades.', 450.00, 399.00, 1200.00, 15, '💄', '/images/ai/kalaya_lipstick_front.png', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 6: Entertainment
(26, 6, 124, 6, 'Ceramic Detail & Hydrophobic Coat', 'Quartz-grade hydrophobic ceramic coating application protecting car paint with hyper gloss.', 350.00, 299.00, 700.00, 10, '🚗', '/images/vendors/vendor_8.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(27, 6, 124, 6, 'Kings Premium Exterior Car Wash', 'High-pressure foam wash, active wax coat paint protection, tires dressing, and clean.', 15.00, 12.00, 20.00, 200, '🚿', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, 6, 106, 6, 'VR Arcade Unlimited Pass (2h)', 'Unlimited access pass to all premium VR gaming capsules and arcade simulators.', 20.00, 18.00, 30.00, 150, '🎮', '/images/categories/cat_4.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(29, 6, 107, 6, 'Express Suit Dry Cleaning', 'Fast dry wash, stain pre-treatment and steam pressing for business suits.', 10.00, 8.00, 15.00, 60, '🧺', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(30, 6, 108, 6, 'Azers VIP Cinema Movie Ticket', 'Standard VIP recliner movie ticket voucher valid for any blockbuster screening.', 9.99, 8.50, 15.00, 300, '🎬', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 7: Services
(31, 6, 111, 7, 'Omnia Horizon Smart Tablet 11"', 'Sleek 11-inch screen tablet with titanium cover, active pencil support and 120Hz display.', 640.00, 580.00, 800.00, 20, '💻', '/images/vendors/vendor_1.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, 6, 111, 7, 'Omnia A-Fold S1 5G 512GB', 'Next-gen folding screen smartphone featuring triple camera array and seamless multitasking.', 980.00, 899.00, 1250.00, 10, '📲', '/images/banners/banner1.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(33, 6, 120, 7, 'SuperBass ANC Wireless Earbuds', 'Active Noise Canceling earbuds with high-fidelity sound driver and 40-hour combined playback.', 45.00, 35.00, 65.00, 120, '🎧', '/images/banners/banner2.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, 6, 110, 7, 'Smart-Vision 65" Ultra HD TV', '4K QLED smart screen television featuring built-in smart dashboard and hands-free controls.', 580.00, 520.00, 750.00, 8, '📺', '/images/details/card_1.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(35, 6, 111, 7, 'Omnia 100W GaN Super Charger', 'Compact high-power GaN multi-port wall charger for fast charging laptops and phones.', 29.00, 25.00, 45.00, 80, '🔌', '/images/details/card_2.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 8: Electronics
(36, 3, 113, 8, 'Anti-Blue Light Reading Glasses', 'Comfortable reading glasses designed with blue light filter lenses protecting eyes from screen glare.', 25.00, 20.00, 40.00, 150, '👓', '/images/products/product_6.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(37, 3, 122, 8, 'Lady Lili Sanitary Pads (24 Pack)', 'Organic cotton breathable sanitary pads with active leakage protection wings.', 4.00, 3.50, 5.50, 300, '🌸', '/images/vendors/vendor_6.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(38, 3, 125, 8, 'Carlos Vitamin C Immune Boost', 'High-potency daily Vitamin C supplements for comprehensive immune support.', 12.00, 10.00, 18.00, 200, '💊', '/images/categories/services.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(39, 3, 126, 8, 'Puredent Herbal Toothpaste', 'Natural herbal extract peppermint toothpaste providing long-lasting breath and cavity protection.', 3.50, 2.80, 5.00, 250, '🦷', '/images/vendors/vendor_6.jpg', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(40, 3, 113, 8, 'Lightweight Prescription Eyewear Frame', 'Sleek, lightweight square frame designed for custom lenses.', 145.00, 120.00, 220.00, 45, '👓', '/images/products/product_6.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 9: Health & Pharmaceutics
(41, 7, 113, 9, 'Anti-Blue Light Reading Glasses', 'Comfortable reading glasses designed with blue light filter lenses protecting eyes from screen glare.', 25.00, 20.00, 40.00, 150, '👓', '/images/products/product_6.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(42, 7, 122, 9, 'Lady Lili Sanitary Pads (24 Pack)', 'Organic cotton breathable sanitary pads with active leakage protection wings.', 4.00, 3.50, 5.50, 300, '🌸', '/images/vendors/vendor_6.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(43, 7, 125, 9, 'Carlos Vitamin C Immune Boost', 'High-potency daily Vitamin C supplements for comprehensive immune support.', 12.00, 10.00, 18.00, 200, '💊', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(44, 7, 126, 9, 'Puredent Herbal Toothpaste', 'Natural herbal extract peppermint toothpaste providing long-lasting breath and cavity protection.', 3.50, 2.80, 5.00, 250, '🦷', '/images/vendors/vendor_6.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 7, 113, 9, 'Lightweight Prescription Eyewear Frame', 'Sleek, lightweight square frame designed for custom lenses.', 145.00, 120.00, 220.00, 45, '👓', '/images/products/product_6.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Category 10: Banking
(46, 3, 121, 10, 'Premium Metal Debit Card Setup', 'Instant customized contactless heavy-metal premium debit card', 5.00, 4.00, 10.00, 500, '💳', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(47, 3, 121, 10, 'Business Checkbook Setup', 'Express customized business account checkbook printing service', 15.00, 12.00, 25.00, 100, '📝', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(48, 3, 121, 10, 'Financial Wealth Advisory Session', 'One-on-one session with senior private banking certified advisor', 120.00, 100.00, 150.00, 20, '📈', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(49, 3, 121, 10, 'Premium Safe Deposit Locker', 'Annual lock box rental in ultra-secure biometric vault room', 85.00, 75.00, 120.00, 30, '🔑', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(50, 3, 121, 10, 'Priority Banking Lounge Pass', 'Annual express priority teller counter access and VIP lounge pass', 50.00, 45.00, 80.00, 100, '🎟️', '/images/categories/services.jpg', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

