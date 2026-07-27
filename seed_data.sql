-- 1. Alter tables to support local string paths instead of binary blobs (Option A)
ALTER TABLE categories CHANGE COLUMN image_data image_url VARCHAR(255);
ALTER TABLE product_images CHANGE COLUMN image_data image_url VARCHAR(255) NOT NULL;

-- 2. Clear existing data (if necessary, uncomment these if starting fresh)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE product_images;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 3. Insert Categories
INSERT INTO categories (id, name, image_url, description) VALUES
(1, 'Restaurant & Food', '/images/categories/restaurant.jpg', 'Restaurants and Eateries'),
(2, 'Fashion & Clothing', '/images/categories/fashion.jpg', 'Clothing and Boutiques'),
(3, 'Household & Lifestyle', '/images/categories/household.jpg', 'Household accessories and smart home'),
(4, 'Groceries', '/images/categories/groceries.jpg', 'Daily needs and groceries'),
(5, 'Salon & Beauty', '/images/categories/salon.jpg', 'Hair, make-up, and beauty'),
(6, 'Entertainment', '/images/categories/entertainment.jpg', 'Games, arcade, and cinema'),
(7, 'Services', '/images/categories/services.jpg', 'Dry cleaning, car wash, and eye care'),
(8, 'Electronics', '/images/categories/electronics.jpg', 'Mobile phones and gadgets'),
(9, 'Health & Pharmaceutics', '/images/categories/health.jpg', 'Pharmacy and healthcare'),
(10, 'Banking', '/images/categories/banking.jpg', 'Financial services');

-- 4. Insert Vendors (Users with VENDOR role)
INSERT INTO users (id, email, first_name, last_name, role) VALUES
(101, 'jazari@vendor.com', 'Jazari', 'Restaurant', 'VENDOR'),
(102, 'akara@vendor.com', 'Finger Licking', 'Akara', 'VENDOR'),
(103, 'fashionredemption@vendor.com', 'Fashion', 'Redemption', 'VENDOR'),
(104, 'homeworld@vendor.com', 'Home', 'World', 'VENDOR'),
(105, 'sharers@vendor.com', 'Sharers', 'Group', 'VENDOR'),
(106, 'makeupstudio@vendor.com', 'Make Up', 'Studio', 'VENDOR'),
(107, 'playarena@vendor.com', 'The Play', 'Arena', 'VENDOR'),
(108, 'washspot@vendor.com', 'The Wash', 'Spot', 'VENDOR'),
(109, 'azerscinema@vendor.com', 'Azers', 'Cinema', 'VENDOR'),
(110, 'minisou@vendor.com', 'Mini', 'Sou', 'VENDOR'),
(111, 'smarthome@vendor.com', 'Smart Home', 'Solutions', 'VENDOR'),
(112, 'omniatech@vendor.com', 'Omnia Tech', 'World', 'VENDOR'),
(113, 'loveworld@vendor.com', 'Loveworld', 'Store', 'VENDOR'),
(114, 'omniaeye@vendor.com', 'Omnia', 'Eye Clinic', 'VENDOR'),
(115, 'allnatural@vendor.com', 'All', 'Natural', 'VENDOR'),
(116, 'capelli@vendor.com', 'Capelli', 'Salon', 'VENDOR'),
(117, 'omniahealth@vendor.com', 'Omnia', 'Health', 'VENDOR'),
(118, 'beverly@vendor.com', 'Beverly', 'Meals', 'VENDOR'),
(119, 'auxano@vendor.com', 'Auxano', 'Restaurant', 'VENDOR'),
(120, 'cwebistro@vendor.com', 'CWE', 'Bistro', 'VENDOR'),
(121, 'pointek@vendor.com', 'Pointek', 'Gadgets', 'VENDOR'),
(122, 'parallex@vendor.com', 'Parallex', 'Bank', 'VENDOR'),
(123, 'ladylili@vendor.com', 'Lady Lili', 'Pads', 'VENDOR'),
(124, 'dixons@vendor.com', 'Dixons', 'Foods', 'VENDOR'),
(125, 'kingscarwash@vendor.com', 'Kings', 'Carwash', 'VENDOR'),
(126, 'carlospharm@vendor.com', 'Carlos', 'Pharmaceutics', 'VENDOR'),
(127, 'puredent@vendor.com', 'Puredent', 'Toothpaste', 'VENDOR');

-- 5. Insert Products / Services
INSERT INTO products (id, vendor_id, category_id, name, description, price) VALUES
(1, 101, 1, 'Jazari Special Meal', 'Delicious restaurant meal', 15.00),
(2, 102, 1, 'Finger Licking Fries', 'Crispy fries and Akara', 5.50),
(3, 103, 2, 'Trendy Fashion Wear', 'Latest clothing and apparel', 45.00),
(4, 104, 3, 'Household Accessories Bundle', 'Beauty products and utensils', 25.00),
(5, 105, 4, 'Sharers Groceries', 'Fresh groceries and daily needs', 30.00),
(6, 105, 2, 'Sharers Bridals & Boutique', 'Male & female boutique items', 150.00),
(7, 105, 5, 'Sharers Salon Session', 'Male + female salon services', 20.00),
(8, 106, 5, 'Make Up Session', 'Professional make up studio service', 40.00),
(9, 107, 6, 'Arcade Pass', 'Games and arcade center entry', 10.00),
(10, 108, 7, 'Dry Cleaning Service', 'Premium laundry services', 12.00),
(11, 109, 6, 'Movie Ticket', 'Latest blockbuster at Azers Cinema', 8.00),
(12, 110, 3, 'Lifestyle Beauty Kit', 'Home products and beauty kit', 35.00),
(13, 111, 3, 'Smart Washing Machine', 'Household appliances and gadgets', 450.00),
(14, 112, 8, 'Latest Smart Phone', 'Mobile devices and accessories', 800.00),
(15, 113, 3, 'Gift Souvenir', 'Special gift items', 15.00),
(16, 114, 7, 'Eye Care Checkup', 'Comprehensive eye care services', 50.00),
(17, 115, 1, 'Healthy Snacks Pack', 'Beverages and healthy snacks', 12.50),
(18, 116, 5, 'Hair Styling Package', 'Salon styling and hair products', 60.00),
(19, 117, 9, 'Pharmaceutic Essentials', 'Lifestyle store pharmaceutics', 25.00),
(20, 118, 1, 'Baked Goods Assortment', 'Fresh baked foods', 18.00),
(21, 119, 1, 'Auxano Special Course', 'Restaurant premium meal', 30.00),
(22, 120, 1, 'Bistro Dinner', 'CWE Bistro special dinner', 28.00),
(23, 121, 8, 'Phone Accessories Combo', 'Smart phones and accessories', 22.00),
(24, 122, 10, 'Banking Consultation', 'Premium banking services', 0.00),
(25, 123, 9, 'Lady Lili Sanitary Pad', 'Comfortable sanitary pads', 5.00),
(26, 124, 4, 'Stock Cubes & Noodles', 'Food items and seasoning', 10.00),
(27, 125, 7, 'Premium Car Wash', 'Car cleaning accessories and services', 20.00),
(28, 126, 9, 'Carlos Health Supplements', 'Pharmaceutics and supplements', 35.00),
(29, 127, 9, 'Puredent Toothpaste', 'Advanced dental care toothpaste', 4.50);

-- 6. Insert Product Images (Linking local images you uploaded)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(29, '/images/puredent.png', TRUE),
(28, '/images/carlos-pharmacy.jpg', TRUE),
(27, '/images/kings-carwash.png', TRUE),
(25, '/images/lady-lili.jpg', TRUE),
(24, '/images/parallex.png', TRUE);
-- Note: Replace .png/.jpg based on your exact file extensions when you save them!
