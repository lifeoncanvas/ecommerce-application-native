# HTTN / KingsShoppers - Complete System Guide

This document provides a comprehensive guide covering all features of the application, how user and vendor registration work, and step-by-step instructions to install and run the complete system on a single machine.

---

## 1. Application Functionality Overview

The system consists of three main modules integrated into a unified e-commerce platform:

### A. Customer App (Shopper Experience)
- **Mall & Home Feed**: Banners, curated brand listings, flash sales with countdown timers, top categories (Food, Fashion, Groceries, Beauty, Electronics), and infinite product pagination.
- **Store Showcase**: Customers can view individual stores (e.g., Nike Store, Jazari Restaurant, Apple Official Store) and explore items uploaded by that specific store owner.
- **Product Listing & Filtering**: Filter by category, price ranges, brand, gender, size, and sorting (Popularity, Price Low to High, Price High to Low, Rating).
- **Product Details Page**: Full photo gallery, price breakdown, coupon applicability, stock availability, wishlist button, customer reviews, and "Add to Cart".
- **Cart & Checkout**: Cart CRUD operations, quantity increment/decrement, tax/delivery calculation, checkout screen with delivery address selector, and payment screen.
- **User Profile**: View order history, track order status (Placed, Processing, Dispatched, Delivered), edit profile, change password, and switch light/dark theme.

### B. Store Management Portal (Store Owners / Managers)
- **Store Authentication**: Dedicated login for store owners (`nike@store.com`, `jazari@vendor.com`, `apple@store.com`).
- **Store Profile Management**: View and edit store name, business description, logo URL, and contact information.
- **My Products (Live Database Sync)**: Real-time product inventory connected directly to Spring Boot & MySQL DB (`GET /api/stores/{storeId}/products`).
- **Add Product Modal**: Form to upload Product Name, Price, Category, Stock Quantity, Description, Emoji Icon, and Showcase Images (`POST /api/stores/my-store/products`).
- **Edit & Delete Product**: Instant update (`PUT /api/products/{id}`) and removal (`DELETE /api/products/{id}`) of store listings.
- **Real-Time App Update**: Products added or updated in the Store Portal automatically display in the customer app under the store.

### C. Admin & Vendor Registration Flow
- **Become a Vendor / Register Store**: Users can submit vendor registration details (Business Name, Description, Documents) via the app.
- **Order Management**: Vendors can process incoming customer orders through status stages (`Placed` → `Processing` → `Dispatched` → `Delivered`).

---

## 2. How Registration Works

### Customer Registration
1. User opens the app → Navigates to **Login / Register**.
2. Fills in **Name**, **Email**, and **Password**.
3. System sends an Email Verification OTP (`POST /api/auth/register`).
4. User inputs the 6-digit OTP code (`POST /api/auth/verify-email`).
5. Account status changes to `ACTIVE` and user can log in.

### Store Owner / Vendor Registration
1. Logged-in user navigates to **Profile** → **Become a Vendor**.
2. Fills in **Business Name**, **Business Category**, and **Business Description**.
3. Uploads business document verification (ID / License).
4. Submits request (`POST /api/vendor/register`).
5. Upon verification, a `Store` record is created in the `stores` table and linked in `store_users` with role `OWNER`.
6. The user can now access the **Store Portal** to upload and manage products!

---

## 3. Single-System Installation Guide (Step-by-Step)

To install and run the complete system on one machine, ensure you have the following prerequisites installed:

### Prerequisites
- **Node.js** (v18 or v20+) — [Download Node.js](https://nodejs.org)
- **Java JDK 21** — [Download JDK 21](https://oracle.com/java/technologies/downloads/)
- **Apache Maven** — [Download Maven](https://maven.apache.org/download.cgi)
- **MySQL Server** (v8.0+) — [Download MySQL](https://dev.mysql.com/downloads/installer/)

---

### Step 1: Database Setup (MySQL)
1. Open **MySQL Workbench** or command line terminal.
2. Create the database (if not already created):
   ```sql
   CREATE DATABASE IF NOT EXISTS ecommerce_db;
   ```
3. Run the seed script to set up tables and initial data:
   ```bash
   mysql -u root -p ecommerce_db < seed_data.sql
   ```

---

### Step 2: Configure & Start Spring Boot Backend
1. Open [app/src/main/resources/application.properties](file:///c:/Users/Sharon/ecommerceapp/app/src/main/resources/application.properties) and set your MySQL password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true&useSSL=false
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
2. Open terminal in the `./app` directory and start the Spring Boot server:
   ```bash
   cd app
   mvn spring-boot:run
   ```
3. The backend API is now running at **`http://localhost:8084`**.

---

### Step 3: Configure & Start Frontend (Expo Web / Mobile)
1. Open a new terminal window in the root directory `c:\Users\Sharon\ecommerceapp`.
2. Install dependencies (if first time):
   ```bash
   npm install
   ```
3. Start the application:
   - **For Web**:
     ```bash
     npm run web
     ```
     Open `http://localhost:8081` in your browser.
   - **For Mobile (Android / iOS)**:
     ```bash
     npm start
     ```
     Scan the QR code with **Expo Go** app on your phone.

---

## 4. Default Demo Accounts

| User Type | Email | Password | Role / Access |
|---|---|---|---|
| **Normal Customer** | `user@gmail.com` | `password` | Shopper Account (Cart, Checkout, Wishlist, Profile) |
| **Normal Customer** | `customer@gmail.com` | `password` | Shopper Account (Cart, Checkout, Wishlist, Profile) |
| **Normal Customer** | `buyer@gmail.com` | `password` | Shopper Account (Cart, Checkout, Wishlist, Profile) |
| **Store Owner (Nike)** | `nike@store.com` | `password` | Nike Store Portal (Add/Edit Shoes & Wear) |
| **Store Owner (Jazari)** | `jazari@vendor.com` | `password` | Jazari Restaurant Portal (Add/Edit Meals) |
| **Store Owner (Apple)** | `apple@store.com` | `password` | Apple Store Portal (Add/Edit Electronics) |
