import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
} from '../api/cart.api';
import { resolveProduct } from '../utils/productResolver';

const CartContext = createContext(null);

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export const CartProvider = ({ children }) => {
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted cart on startup
  useEffect(() => {
    async function loadCart() {
      try {
        const stored = await AsyncStorage.getItem('@cart_items');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalItems(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load cart from AsyncStorage:', e);
      } finally {
        setIsInitialized(true);
      }
    }
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    async function saveCart() {
      try {
        await AsyncStorage.setItem('@cart_items', JSON.stringify(localItems));
      } catch (e) {
        console.warn('Failed to save cart to AsyncStorage:', e);
      }
    }
    saveCart();
  }, [localItems, isInitialized]);

  // Fetch cart items from Spring Boot (only replace if backend returns populated items)
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await withTimeout(getCart(), 2000);
      if (Array.isArray(data?.items) && data.items.length > 0) {
        setLocalItems(data.items);
      }
    } catch (e) {
      console.warn('Cart API fetch failed, running in local fallback mode.', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Item
  const addItem = async (productId, quantity = 1, customProductData = null) => {
    const product = customProductData || resolveProduct(productId);
    const isBooking = !!(
      customProductData?.isBooking ||
      product?.isBooking ||
      product?.categoryId === 'cat_services' ||
      product?.categoryId === 'cat_food' ||
      (typeof product?.category === 'string' &&
        (product.category.toLowerCase().includes('service') || product.category.toLowerCase().includes('food')))
    );

    const bookingDay = isBooking ? (customProductData?.bookingDay || 'Today') : null;
    const bookingTimeSlot = isBooking ? (customProductData?.bookingTimeSlot || '12:00 PM - 01:30 PM') : null;
    const size = isBooking ? '' : (customProductData?.size || 'L');
    const color = isBooking ? '' : (customProductData?.color || 'Fuchsia');
    const colorHex = isBooking ? '' : (customProductData?.colorHex || '#BA5392');

    // Unblock this item ID from removed list if previously removed
    try {
      const storedRemoved = await AsyncStorage.getItem('@removed_cart_ids');
      if (storedRemoved) {
        const removedArr = JSON.parse(storedRemoved);
        const filteredRemoved = removedArr.filter((id) => String(id) !== String(productId));
        await AsyncStorage.setItem('@removed_cart_ids', JSON.stringify(filteredRemoved));
      }
    } catch (e) {
      console.warn('Error clearing removed cart id:', e);
    }

    setLocalItems((prev) => {
      const currentList = Array.isArray(prev) ? prev : [];
      // For bookings, match by ID and date/time; for physical products, match by ID and size/color
      const existingIndex = currentList.findIndex((item) => {
        if (String(item?.id) !== String(productId)) return false;
        if (isBooking) {
          return item.bookingDay === bookingDay && item.bookingTimeSlot === bookingTimeSlot;
        }
        return item.size === size && item.color === color;
      });

      if (existingIndex > -1) {
        const updated = [...currentList];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex]?.quantity || 1) + quantity,
        };
        return updated;
      }

      const newItem = {
        id: String(product?.id || productId),
        name: product?.name || product?.title || 'Product',
        title: product?.title || product?.name || 'Product',
        brand: product?.brand || (isBooking ? 'Services & Fun' : 'Vero Moda'),
        price: Number(product?.price) || 999,
        oldPrice: product?.oldPrice || product?.mrp || null,
        discount: product?.discount || null,
        badges: Array.isArray(product?.badges) ? product.badges : (isBooking ? ['Confirmed Slot', 'Top Rated'] : ['Fast delivery', 'Trendy']),
        image: product?.image,
        size,
        color,
        colorHex,
        isBooking,
        categoryId: product?.categoryId || (isBooking ? 'cat_services' : 'cat_fashion'),
        category: product?.category || (isBooking ? 'Services & Fun' : 'Fashion & Apparel'),
        bookingDay,
        bookingTimeSlot,
        quantity,
      };

      return [...currentList, newItem];
    });

    // Background sync attempt without resetting state on failure
    try {
      await withTimeout(addToCartApi(productId, quantity), 2000);
    } catch (e) {
      console.warn('Cart API background sync failed, local state preserved.', e.message);
    }
  };

  // Update Item Quantity
  const updateItem = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    setLocalItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) => (String(item?.id) === String(itemId) ? { ...item, quantity } : item))
    );

    try {
      await withTimeout(updateCartItem(itemId, quantity), 2000);
    } catch (e) {
      console.warn('Cart API update failed, local state preserved.');
    }
  };

  // Remove Item
  const removeItem = async (itemId) => {
    setLocalItems((prev) => (Array.isArray(prev) ? prev : []).filter((item) => String(item?.id) !== String(itemId)));

    try {
      await withTimeout(removeCartItem(itemId), 2000);
    } catch (e) {
      console.warn('Cart API remove failed, local state preserved.');
    }
  };

  // Clear Cart
  const clear = async () => {
    setLocalItems([]);
    setDiscountAmount(0);
    setCouponCode('');

    try {
      await AsyncStorage.removeItem('@cart_items');
      await withTimeout(clearCart(), 2000);
    } catch (e) {
      console.warn('Cart API clear failed, local state preserved.');
    }
  };

  // Apply Coupon
  const applyPromoCoupon = async (code) => {
    setCouponError('');
    try {
      const res = await withTimeout(applyCoupon(code), 2000);
      if (res.data?.discountAmount) {
        setCouponCode(code);
        setDiscountAmount(res.data.discountAmount || 0);
      }
    } catch (e) {
      console.warn('Coupon API apply failed, validating local mock coupon codes.');
      const normalizedCode = (code || '').trim().toUpperCase();
      if (normalizedCode === 'DISCOUNT10' || normalizedCode === 'WELCOME') {
        setCouponCode(normalizedCode);
        setCouponError('');
        const safeLocal = Array.isArray(localItems) ? localItems : [];
        const subtotal = safeLocal.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0);
        setDiscountAmount(subtotal * 0.1);
      } else {
        setCouponError('Invalid promo code. Try "DISCOUNT10"');
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: Array.isArray(localItems) ? localItems : [],
        loading,
        refreshCart,
        addItem,
        updateItem,
        removeItem,
        clear,
        applyPromoCoupon,
        couponCode,
        discountAmount,
        couponError,
        setCouponError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
