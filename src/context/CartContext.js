import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
} from '../api/cart.api';
import { products } from '../data/mockData';

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

  // Fetch cart items from Spring Boot
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await withTimeout(getCart(), 2000);
      setLocalItems(data.items ?? []);
    } catch (e) {
      console.warn('Cart API fetch failed, running in local fallback mode.', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Item
  const addItem = async (productId, quantity = 1, customProductData = null) => {
    try {
      await withTimeout(addToCartApi(productId, quantity), 2000);
      await refreshCart();
    } catch (e) {
      console.warn('Cart API add failed, adding to local fallback cart state.');
      const product = customProductData || products.find((p) => p.id === productId) || { id: productId, name: 'Product', price: 999 };

      setLocalItems((prev) => {
        const existing = prev.find((item) => item.id === productId);
        if (existing) {
          return prev.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name || product.title || 'Product',
            brand: product.brand || 'Vero Moda',
            price: Number(product.price) || 999,
            image: product.image,
            size: customProductData?.size || 'L',
            color: customProductData?.color || 'Fuchsia',
            quantity: quantity,
          },
        ];
      });
    }
  };

  // Update Item Quantity
  const updateItem = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      await withTimeout(updateCartItem(itemId, quantity), 2000);
      await refreshCart();
    } catch (e) {
      console.warn('Cart API update failed, adjusting local state.');
      setLocalItems((prev) =>
        prev.map((item) => (String(item.id) === String(itemId) ? { ...item, quantity } : item))
      );
    }
  };

  // Remove Item
  const removeItem = async (itemId) => {
    try {
      await withTimeout(removeCartItem(itemId), 2000);
      await refreshCart();
    } catch (e) {
      console.warn('Cart API remove failed, adjusting local state.');
      setLocalItems((prev) => prev.filter((item) => String(item.id) !== String(itemId)));
    }
  };

  // Clear Cart
  const clear = async () => {
    try {
      await withTimeout(clearCart(), 2000);
      await refreshCart();
    } catch (e) {
      console.warn('Cart API clear failed, adjusting local state.');
      setLocalItems([]);
      setDiscountAmount(0);
      setCouponCode('');
    }
  };

  // Apply Coupon
  const applyPromoCoupon = async (code) => {
    setCouponError('');
    try {
      const res = await withTimeout(applyCoupon(code), 2000);
      if (res.data) {
        setCouponCode(code);
        setDiscountAmount(res.data.discountAmount || 0);
      }
    } catch (e) {
      console.warn('Coupon API apply failed, validating local mock coupon codes.');
      const normalizedCode = code.trim().toUpperCase();
      if (normalizedCode === 'DISCOUNT10' || normalizedCode === 'WELCOME') {
        setCouponCode(normalizedCode);
        setCouponError('');
        // Subtotal calculation for mock discount
        const subtotal = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setDiscountAmount(subtotal * 0.1); // 10% Off
      } else {
        setCouponError('Invalid promo code. Try "DISCOUNT10"');
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: localItems,
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
