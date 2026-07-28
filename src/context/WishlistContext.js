import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/cart.api';
import { products as mockProducts } from '../data/mockData';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export const WishlistProvider = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(['p_jazari_1', 'p_redemp_1', 'p_capelli_1']); // Default items shown in mockup
  const [loading, setLoading] = useState(false);

  // Sync with API in background
  const syncWishlist = useCallback(async () => {
    if (!user || isGuest) return; // Don't fetch if not logged in
    try {
      const res = await withTimeout(getWishlist(), 2000);
      const list = res.data?.items || res.data || [];
      // map backend product IDs if returned
      const ids = list.map((item) => item.productId || item.id || item);
      if (ids.length > 0) setWishlistIds(ids);
    } catch (e) {
      console.warn('GET /api/wishlist failed. Operating in offline/mock mode.', e.message);
    }
  }, [user, isGuest]);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  const isLiked = useCallback((productId) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const toggleWishlist = useCallback(async (productId) => {
    const isCurrentlyLiked = wishlistIds.includes(productId);
    
    // Optimistic UI update
    setWishlistIds((prev) => 
      isCurrentlyLiked ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    try {
      if (isCurrentlyLiked) {
        await withTimeout(removeFromWishlist(productId), 2000);
      } else {
        await withTimeout(addToWishlist(productId), 2000);
      }
    } catch (e) {
      console.warn(`Wishlist API sync failed for product ${productId}. Saving changes locally.`, e.message);
    }
  }, [wishlistIds]);

  // Map wishlist IDs to full mock product objects for the list view
  const wishlistItems = wishlistIds
    .map((id) => mockProducts.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <WishlistContext.Provider value={{ wishlistItems, isLiked, toggleWishlist, loading, refreshWishlist: syncWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
