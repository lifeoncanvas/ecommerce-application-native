# HTTN — React Native Starter

Frontend starter for the multi-vendor ecommerce app, matching the backend API doc
(Spring Boot / MySQL / Redis / S3 / Stripe-PayPal-Espees / Firebase / OAuth).

## 1. Install

```bash
npm install
```

If you don't have the Expo CLI yet, you don't need to install it globally —
`npx` runs it for you.

## 2. Set your backend URL

Open `src/api/client.js` and update:

```js
export const BASE_URL = 'http://192.168.1.42:8080/api';
```

Important: if you're testing on a physical phone via Expo Go, `localhost` will NOT
work — Expo Go is on your phone, not your laptop. Use your laptop's local network
IP (find it with `ipconfig getifaddr en0` on Mac, or `ipconfig` on Windows) and
make sure your phone and laptop are on the same Wi-Fi network.

## 3. Run it

```bash
npx expo start
```

Scan the QR code with the Expo Go app (iOS: Camera app, Android: Expo Go app itself).

## Folder structure

```
src/
├── api/          # one file per backend API group — axios calls only, no UI logic
├── theme/        # colors, typography, spacing — pulled into every screen
├── context/      # AuthContext (login/logout/token), CartContext (cart state)
├── navigation/   # RootNavigator switches Auth <-> Main based on login state
├── screens/      # one folder per feature area
└── components/   # reusable Button, Input, ProductCard
```

## What's wired up already

- Login → OTP → Register → Forgot Password flow (calls the real endpoints from your API doc)
- Auth token stored securely with `expo-secure-store`, attached to every request automatically
- Token auto-cleared on 401 responses
- Bottom tab navigation: Home / Categories / Wishlist / Cart / Profile
- Home screen pulls Flash Sale + Featured products
- Product Listing → Product Details → Add to Cart flow
- Cart screen with checkout button (Checkout screen itself is a TODO — see below)

## What's intentionally left as TODO

This covers the first ~15 screens from your doc so you have a working pattern to copy.
Not built yet (same pattern applies to all of these):

- Checkout / Payment / Order Success
- My Orders / Order Details / Track Order
- Search + filters
- Notifications
- Settings / Change Password / Addresses (CRUD screens — Address API is already in `orders.api.js`)
- Vendor Store / Become Vendor / Vendor Dashboard / Vendor Products / Vendor Orders
- Reviews, Exchange, Academy, Coupons, Loyalty, Support, static content pages

To add a new screen: create it in the matching `src/screens/<area>/` folder, add it to
the relevant navigator file, and add its API calls to the matching `src/api/*.api.js` file
if one doesn't already exist for that group.

## Next steps

1. `npm install` and get Login → Home working end-to-end against your real backend
2. Confirm your backend's actual response shape matches what the screens expect
   (e.g. `data.items`, `data.token`, `data.user`) — adjust as needed, this is a guess
   based on common conventions, not your backend's real contract
3. Build out one remaining screen at a time using the existing screens as your template
