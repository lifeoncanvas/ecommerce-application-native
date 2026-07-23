import React, { createContext, useContext, useState, useCallback } from 'react';
import { getCart, addToCart as addToCartApi } from '../api/cart.api';
import { products } from '../data/mockData';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCart();
      setLocalItems(data.items ?? []);
    } catch (e) {
      console.warn('Cart API fetch failed, running in local fallback mode.');
      // Keep existing localItems or construct them if empty
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (productId, quantity = 1) => {
    try {
      await addToCartApi(productId, quantity);
      await refreshCart();
    } catch (e) {
      console.warn('Cart API add failed, adding to local fallback cart state.');
      const product = products.find((p) => p.id === productId);
      if (!product) return;

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
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: quantity,
          },
        ];
      });
    }
  };

  return (
    <CartContext.Provider value={{ items: localItems, loading, refreshCart, addItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
