# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HTTN / KingsShoppers** is a full-stack e-commerce application:

- **Frontend**: Expo React Native (`httn-app/`) — targets Expo Go, Android, iOS, and Web.
- **Backend**: Spring Boot REST API with MySQL database (separate repository / service).
- **Communication**: Axios HTTP client with JWT Bearer token auth; currently runs in offline/mock mode during development.

---

## Common Commands

```bash
npm install              # install dependencies
npm start                # start Expo dev server (interactive menu)
npm run android          # launch on Android emulator / device
npm run ios              # launch on iOS simulator / device
npm run web              # launch in browser
npx expo start           # equivalent direct Expo start command
```

> There are **no** configured `test`, `lint`, or `build` scripts in `package.json` and no tests under `src/`. Do not assume a test runner exists until it is added.

---

## Runtime Configuration

All API config lives in [`src/api/client.js`](src/api/client.js).

| Key | Value | Notes |
|-----|-------|-------|
| `IS_OFFLINE` | `true` | Set to `false` to connect to the Spring Boot backend |
| `BASE_URL` | `http://10.0.2.2:8082/api` (Android) / `http://localhost:8082/api` (others) | Replace with LAN IP for physical devices |
| `timeout` | `5000 ms` | Axios request timeout |

**Auth tokens:**
- Native (Android/iOS): stored via `expo-secure-store` under the key `authToken`
- Web: stored via `@react-native-async-storage/async-storage` under the key `authToken`

**Error handling in the client:**
- `401` → token cleared via `deleteToken()`; user should be redirected to Login from `AuthContext`
- `404` / `500` → logs a warning and returns `{ data: { items: [], content: [] } }` so the UI does not crash

---

## Backend (Spring Boot + MySQL)

- **Port**: `8082` (default dev configuration)
- **Base path**: `/api`
- **Auth**: JWT Bearer tokens — the client attaches `Authorization: Bearer <token>` to every request automatically
- **Database**: MySQL — seed data is in [`seed_data.sql`](seed_data.sql) at the project root
- When switching from offline to live backend, set `IS_OFFLINE = false` in `src/api/client.js` and ensure the Spring Boot service is running and reachable

---

## Architecture

### Entry Point

[`App.js`](App.js) is the composition root. It:
1. Loads **Plus Jakarta Sans** and **Inter** fonts via `expo-font`
2. Registers push notifications via `src/utils/notificationManager.js`
3. Wraps the app in providers (order matters):
   ```
   SafeAreaProvider
   └── AuthProvider
       └── ThemeProvider
           └── WishlistProvider
               └── CartProvider
                   └── RootNavigator
   ```

### Navigation

| File | Purpose |
|------|---------|
| [`src/navigation/RootNavigator.js`](src/navigation/RootNavigator.js) | Top-level gate: splash while auth loads, then `AuthStack` or `MainTabNavigator` |
| [`src/navigation/AuthStack.js`](src/navigation/AuthStack.js) | Onboarding → Welcome → Login → Register → OTP → ForgotPassword → ResetPassword |
| [`src/navigation/MainTabNavigator.js`](src/navigation/MainTabNavigator.js) | Bottom tabs: Home, Categories, Wishlist, Cart, Profile |

**Nested stacks inside `MainTabNavigator`:**

| Stack | Screens |
|-------|---------|
| **HomeStack** | HomeMain → ProductListing → ProductDetails → Search |
| **CartStack** | CartMain → Checkout → Payment → OrderSuccess |
| **ProfileStack** | ProfileMain → MyOrders → OrderDetails → TrackOrder → EditProfile → Settings → ChangePassword → BecomeVendor → VendorDashboard → VendorStore → ExchangeRequest → ExchangeList → Support → Return → Loyalty → About → PrivacyPolicy → TermsConditions → Contact |

> Always register new screens in the appropriate navigator before navigating to them.

### Context / State

| File | Owns |
|------|------|
| [`src/context/AuthContext.js`](src/context/AuthContext.js) | Session state, guest mode, onboarding flag, login/social-login/logout, token persistence |
| [`src/context/CartContext.js`](src/context/CartContext.js) | Cart items — tries API first (short timeout), falls back to local state + `mockData.js` |
| [`src/context/WishlistContext.js`](src/context/WishlistContext.js) | Wishlist items — same offline-first pattern |
| [`src/context/ThemeContext.js`](src/context/ThemeContext.js) | Light/dark mode, persisted in AsyncStorage; exposes `useTheme()` |

### API Layer

`src/api/*.api.js` files are **thin wrappers** around the shared `client.js` axios instance:

| File | Domain |
|------|--------|
| `auth.api.js` | Login, register, OTP, password reset |
| `products.api.js` | Product listing, details, search |
| `cart.api.js` | Cart CRUD |
| `orders.api.js` | Order placement, history, details |
| `payment.api.js` | Payment initiation |
| `profile.api.js` | User profile CRUD |
| `reviews.api.js` | Product reviews |
| `vendor.api.js` | Vendor registration, dashboard |
| `loyalty.api.js` | Loyalty points |
| `coupons.api.js` | Coupon validation |
| `exchange.api.js` | Exchange requests |
| `notifications.api.js` | Push notification endpoints |
| `support.api.js` | Customer support tickets |
| `content.api.js` | CMS / static content |

> Keep all HTTP calls inside `src/api/`. Keep all UI logic in screens and contexts.

### Screens

```
src/screens/
├── auth/        OnboardingScreen, WelcomeScreen, SplashScreen,
│                LoginScreen, RegisterScreen, OTPScreen,
│                ForgotPasswordScreen, ResetPasswordScreen
├── home/        HomeScreen
├── category/    CategoriesScreen
├── product/     ProductListingScreen, ProductDetailsScreen
├── search/      SearchScreen
├── wishlist/    WishlistScreen
├── cart/        CartScreen, CheckoutScreen, PaymentScreen, OrderSuccessScreen
└── profile/     ProfileScreen, MyOrdersScreen, OrderDetailsScreen,
                 TrackOrderScreen, EditProfileScreen, SettingsScreen,
                 ChangePasswordScreen, BecomeVendorScreen, VendorDashboardScreen,
                 VendorStoreScreen, ExchangeRequestScreen, ExchangeListScreen,
                 SupportScreen, ReturnScreen, LoyaltyScreen, AboutScreen,
                 PrivacyPolicyScreen, TermsConditionsScreen, ContactScreen
```

### Theme

| File | Purpose |
|------|---------|
| [`src/theme/colors.js`](src/theme/colors.js) | Brand palette — Royal Blue (`#032757`) + Gold (`#F6A400`) plus semantic tokens |
| [`src/theme/typography.js`](src/theme/typography.js) | Font scale using Plus Jakarta Sans & Inter |
| [`src/theme/index.js`](src/theme/index.js) | Re-exports theme tokens |

> **Never hardcode hex values.** Always read colors from `useTheme()` or `src/theme/colors.js`.

### Components

[`src/components/`](src/components/) contains reusable primitives:
- `Button.js` — primary/secondary/outline variants
- `Input.js` — text input with label and error state
- `ProductCard.js` — product tile with image, price, and wishlist toggle

> Prefer these over one-off inline styles to maintain UI consistency.

### Utilities

- [`src/utils/notificationManager.js`](src/utils/notificationManager.js) — registers Expo push token and handles permissions
- [`src/data/mockData.js`](src/data/mockData.js) — local fallback data used when `IS_OFFLINE = true`

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~54` | Expo SDK, managed workflow |
| `react-native 0.81.5` | Core framework |
| `react 19.1.0` | React |
| `@react-navigation/*` | Stack + bottom-tab navigation |
| `axios ^1.7` | HTTP client |
| `expo-secure-store` | Native token storage |
| `@react-native-async-storage/async-storage` | Web token storage + theme persistence |
| `expo-notifications` | Push notifications |
| `expo-document-picker` | File/document upload (vendor flow) |
| `phosphor-react-native` | Icon library |
| `react-native-svg` | SVG support |
| `expo-font` + `@expo-google-fonts/*` | Plus Jakarta Sans & Inter |

---

## Adding Features

### New backend-backed screen
1. Add or extend the relevant `src/api/*.api.js` wrapper
2. Wire it from the feature context or screen
3. Register the route in the appropriate navigator (`AuthStack.js` or `MainTabNavigator.js`)

### New tab or stack destination
- Update `MainTabNavigator.js` (for tabs or nested stack screens) or `AuthStack.js` (for auth-flow screens)
- Do **not** navigate to unregistered screen names

### Switching to live backend
1. Set `IS_OFFLINE = false` in `src/api/client.js`
2. Confirm `BASE_URL` points to the running Spring Boot service
3. For physical devices, replace `localhost` / `10.0.2.2` with the machine's LAN IP

### Preserving offline behavior
- Keep mock/fallback logic in contexts and screen `catch` blocks unless the task explicitly requires live data

---

## Database

- **Engine**: MySQL
- **Seed file**: [`seed_data.sql`](seed_data.sql) — run against your local MySQL instance to populate initial data
- Schema is managed by the Spring Boot backend (JPA/Hibernate); do not alter `seed_data.sql` structure without syncing backend entity models
