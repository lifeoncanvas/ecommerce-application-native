-- 1. Alter tables to support local string paths instead of binary blobs (Option A)
ALTER TABLE categories CHANGE COLUMN image_data image_url VARCHAR(255);
ALTER TABLE product_images CHANGE COLUMN image_data image_url VARCHAR(255) NOT NULL;

-- 2. Clear existing data (if necessary, uncomment these if starting fresh)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE vendors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, image_url, description, active, sort_order, created_at, updated_at) VALUES
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

-- 4. Insert Users (role VENDOR)
INSERT INTO users (id, email, first_name, last_name, role, created_at, updated_at) VALUES
(101, 'jazari@vendor.com', 'Jazari', 'Restaurant', 'VENDOR', NOW(), NOW()),
(102, 'akara@vendor.com', 'Finger Licking', 'Akara', 'VENDOR', NOW(), NOW()),
(103, 'fashionredemption@vendor.com', 'Fashion', 'Redemption', 'VENDOR', NOW(), NOW()),
(104, 'homeworld@vendor.com', 'Home', 'World', 'VENDOR', NOW(), NOW()),
(105, 'sharers@vendor.com', 'Sharers', 'Group', 'VENDOR', NOW(), NOW()),
(106, 'makeupstudio@vendor.com', 'Make Up', 'Studio', 'VENDOR', NOW(), NOW()),
(107, 'playarena@vendor.com', 'The Play', 'Arena', 'VENDOR', NOW(), NOW()),
(108, 'washspot@vendor.com', 'The Wash', 'Spot', 'VENDOR', NOW(), NOW()),
(109, 'azerscinema@vendor.com', 'Azers', 'Cinema', 'VENDOR', NOW(), NOW()),
(110, 'minisou@vendor.com', 'Mini', 'Sou', 'VENDOR', NOW(), NOW()),
(111, 'smarthome@vendor.com', 'Smart Home', 'Solutions', 'VENDOR', NOW(), NOW()),
(112, 'omniatech@vendor.com', 'Omnia Tech', 'World', 'VENDOR', NOW(), NOW()),
(113, 'loveworld@vendor.com', 'Loveworld', 'Store', 'VENDOR', NOW(), NOW()),
(114, 'omniaeye@vendor.com', 'Omnia', 'Eye Clinic', 'VENDOR', NOW(), NOW()),
(115, 'allnatural@vendor.com', 'All', 'Natural', 'VENDOR', NOW(), NOW()),
(116, 'capelli@vendor.com', 'Capelli', 'Salon', 'VENDOR', NOW(), NOW()),
(117, 'omniahealth@vendor.com', 'Omnia', 'Health', 'VENDOR', NOW(), NOW()),
(118, 'beverly@vendor.com', 'Beverly', 'Meals', 'VENDOR', NOW(), NOW()),
(119, 'auxano@vendor.com', 'Auxano', 'Restaurant', 'VENDOR', NOW(), NOW()),
(120, 'cwebistro@vendor.com', 'CWE', 'Bistro', 'VENDOR', NOW(), NOW()),
(121, 'pointek@vendor.com', 'Pointek', 'Gadgets', 'VENDOR', NOW(), NOW()),
(122, 'parallex@vendor.com', 'Parallex', 'Bank', 'VENDOR', NOW(), NOW()),
(123, 'ladylili@vendor.com', 'Lady Lili', 'Pads', 'VENDOR', NOW(), NOW()),
(124, 'dixons@vendor.com', 'Dixons', 'Foods', 'VENDOR', NOW(), NOW()),
(125, 'kingscarwash@vendor.com', 'Kings', 'Carwash', 'VENDOR', NOW(), NOW()),
(126, 'carlospharm@vendor.com', 'Carlos', 'Pharmaceutics', 'VENDOR', NOW(), NOW()),
(127, 'puredent@vendor.com', 'Puredent', 'Toothpaste', 'VENDOR', NOW(), NOW());

-- 4b. Insert Vendors (Linked to Users)
INSERT INTO vendors (id, user_id, business_name, business_description, status, verified, total_sales, created_at, updated_at) VALUES
(101, 101, 'Jazari', 'Restaurant', 'APPROVED', 1, 0, NOW(), NOW()),
(102, 102, 'Finger Licking Akara', 'Restaurant', 'APPROVED', 1, 0, NOW(), NOW()),
(103, 103, 'Fashion Redemption', 'Fashion', 'APPROVED', 1, 0, NOW(), NOW()),
(104, 104, 'Home World', 'Home', 'APPROVED', 1, 0, NOW(), NOW()),
(105, 105, 'Sharers Group', 'Group', 'APPROVED', 1, 0, NOW(), NOW()),
(106, 106, 'Make Up Studio', 'Studio', 'APPROVED', 1, 0, NOW(), NOW()),
(107, 107, 'The Play Arena', 'Arena', 'APPROVED', 1, 0, NOW(), NOW()),
(108, 108, 'The Wash Spot', 'Spot', 'APPROVED', 1, 0, NOW(), NOW()),
(109, 109, 'Azers Cinema', 'Cinema', 'APPROVED', 1, 0, NOW(), NOW()),
(110, 110, 'Mini Sou', 'Sou', 'APPROVED', 1, 0, NOW(), NOW()),
(111, 111, 'Smart Home Solutions', 'Solutions', 'APPROVED', 1, 0, NOW(), NOW()),
(112, 112, 'Omnia Tech World', 'World', 'APPROVED', 1, 0, NOW(), NOW()),
(113, 113, 'Loveworld Store', 'Store', 'APPROVED', 1, 0, NOW(), NOW()),
(114, 114, 'Omnia Eye Clinic', 'Eye Clinic', 'APPROVED', 1, 0, NOW(), NOW()),
(115, 115, 'All Natural', 'Natural', 'APPROVED', 1, 0, NOW(), NOW()),
(116, 116, 'Capelli Salon', 'Salon', 'APPROVED', 1, 0, NOW(), NOW()),
(117, 117, 'Omnia Health', 'Health', 'APPROVED', 1, 0, NOW(), NOW()),
(118, 118, 'Beverly Meals', 'Meals', 'APPROVED', 1, 0, NOW(), NOW()),
(119, 119, 'Auxano Restaurant', 'Restaurant', 'APPROVED', 1, 0, NOW(), NOW()),
(120, 120, 'CWE Bistro', 'Bistro', 'APPROVED', 1, 0, NOW(), NOW()),
(121, 121, 'Pointek Gadgets', 'Gadgets', 'APPROVED', 1, 0, NOW(), NOW()),
(122, 122, 'Parallex Bank', 'Bank', 'APPROVED', 1, 0, NOW(), NOW()),
(123, 123, 'Lady Lili Pads', 'Pads', 'APPROVED', 1, 0, NOW(), NOW()),
(124, 124, 'Dixons Foods', 'Foods', 'APPROVED', 1, 0, NOW(), NOW()),
(125, 125, 'Kings Carwash', 'Carwash', 'APPROVED', 1, 0, NOW(), NOW()),
(126, 126, 'Carlos Pharmaceutics', 'Pharmaceutics', 'APPROVED', 1, 0, NOW(), NOW()),
(127, 127, 'Puredent Toothpaste', 'Toothpaste', 'APPROVED', 1, 0, NOW(), NOW());


-- 5. Insert Products / Services
INSERT INTO products (id, vendor_id, category_id, name, description, price, stock_quantity, active, featured, created_at, updated_at) VALUES
(1, 101, 1, 'Jazari Special Meal', 'Delicious restaurant meal', 15.00, 100, 1, 1, NOW(), NOW()),
(2, 102, 1, 'Finger Licking Fries', 'Crispy fries and Akara', 5.50, 100, 1, 1, NOW(), NOW()),
(3, 103, 2, 'Trendy Fashion Wear', 'Latest clothing and apparel', 45.00, 100, 1, 1, NOW(), NOW()),
(4, 104, 3, 'Household Accessories Bundle', 'Beauty products and utensils', 25.00, 100, 1, 0, NOW(), NOW()),
(5, 105, 4, 'Sharers Groceries', 'Fresh groceries and daily needs', 30.00, 100, 1, 1, NOW(), NOW()),
(6, 105, 2, 'Sharers Bridals & Boutique', 'Male & female boutique items', 150.00, 100, 1, 0, NOW(), NOW()),
(7, 105, 5, 'Sharers Salon Session', 'Male + female salon services', 20.00, 100, 1, 1, NOW(), NOW()),
(8, 106, 5, 'Make Up Session', 'Professional make up studio service', 40.00, 100, 1, 0, NOW(), NOW()),
(9, 107, 6, 'Arcade Pass', 'Games and arcade center entry', 10.00, 100, 1, 1, NOW(), NOW()),
(10, 108, 7, 'Dry Cleaning Service', 'Premium laundry services', 12.00, 100, 1, 0, NOW(), NOW()),
(11, 109, 6, 'Movie Ticket', 'Latest blockbuster at Azers Cinema', 8.00, 100, 1, 1, NOW(), NOW()),
(12, 110, 3, 'Lifestyle Beauty Kit', 'Home products and beauty kit', 35.00, 100, 1, 0, NOW(), NOW()),
(13, 111, 3, 'Smart Washing Machine', 'Household appliances and gadgets', 450.00, 10, 1, 1, NOW(), NOW()),
(14, 112, 8, 'Latest Smart Phone', 'Mobile devices and accessories', 800.00, 20, 1, 1, NOW(), NOW()),
(15, 113, 3, 'Gift Souvenir', 'Special gift items', 15.00, 100, 1, 0, NOW(), NOW()),
(16, 114, 7, 'Eye Care Checkup', 'Comprehensive eye care services', 50.00, 100, 1, 0, NOW(), NOW()),
(17, 115, 1, 'Healthy Snacks Pack', 'Beverages and healthy snacks', 12.50, 100, 1, 1, NOW(), NOW()),
(18, 116, 5, 'Hair Styling Package', 'Salon styling and hair products', 60.00, 100, 1, 0, NOW(), NOW()),
(19, 117, 9, 'Pharmaceutic Essentials', 'Lifestyle store pharmaceutics', 25.00, 100, 1, 1, NOW(), NOW()),
(20, 118, 1, 'Baked Goods Assortment', 'Fresh baked foods', 18.00, 100, 1, 0, NOW(), NOW()),
(21, 119, 1, 'Auxano Special Course', 'Restaurant premium meal', 30.00, 100, 1, 1, NOW(), NOW()),
(22, 120, 1, 'Bistro Dinner', 'CWE Bistro special dinner', 28.00, 100, 1, 0, NOW(), NOW()),
(23, 121, 8, 'Phone Accessories Combo', 'Smart phones and accessories', 22.00, 100, 1, 1, NOW(), NOW()),
(24, 122, 10, 'Banking Consultation', 'Premium banking services', 0.00, 100, 1, 0, NOW(), NOW()),
(25, 123, 9, 'Lady Lili Sanitary Pad', 'Comfortable sanitary pads', 5.00, 100, 1, 0, NOW(), NOW()),
(26, 124, 4, 'Stock Cubes & Noodles', 'Food items and seasoning', 10.00, 100, 1, 1, NOW(), NOW()),
(27, 125, 7, 'Premium Car Wash', 'Car cleaning accessories and services', 20.00, 100, 1, 0, NOW(), NOW()),
(28, 126, 9, 'Carlos Health Supplements', 'Pharmaceutics and supplements', 35.00, 100, 1, 1, NOW(), NOW()),
(29, 127, 9, 'Puredent Toothpaste', 'Advanced dental care toothpaste', 4.50, 100, 1, 0, NOW(), NOW());

-- 6. Insert Product Images (Linking local images you uploaded)
INSERT INTO product_images (id, product_id, image_url, is_primary, created_at, updated_at) VALUES
(1, 29, '/images/puredent.png', 1, NOW(), NOW()),
(2, 28, '/images/carlos-pharmacy.jpg', 1, NOW(), NOW()),
(3, 27, '/images/kings-carwash.png', 1, NOW(), NOW()),
(4, 25, '/images/lady-lili.jpg', 1, NOW(), NOW()),
(5, 24, '/images/parallex.png', 1, NOW(), NOW());
-- Note: Replace .png/.jpg based on your exact file extensions when you save them!
