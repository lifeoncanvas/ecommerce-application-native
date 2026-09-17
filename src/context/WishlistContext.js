import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/cart.api';
import { products as mockProducts } from '../data/mockData';
import { ALL_FEED_PRODUCTS } from '../data/mockProductsData';
import { resolveProduct } from '../utils/productResolver';
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
  const [wishlistIds, setWishlistIds] = useState([]);
  const [customItems, setCustomItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted wishlist from AsyncStorage on mount
  useEffect(() => {
    async function loadWishlist() {
      try {
        const storedIds = await AsyncStorage.getItem('@wishlist_ids');
        if (storedIds) {
          const parsed = JSON.parse(storedIds);
          if (Array.isArray(parsed)) {
            setWishlistIds(parsed);
          }
        }
        const storedMeta = await AsyncStorage.getItem('@wishlist_meta');
        if (storedMeta) {
          const parsedMeta = JSON.parse(storedMeta);
          if (parsedMeta && typeof parsedMeta === 'object') {
            setCustomItems(parsedMeta);
          }
        }
      } catch (e) {
        console.warn('Failed to load wishlist from AsyncStorage:', e);
      } finally {
        setIsInitialized(true);
      }
    }
    loadWishlist();
  }, []);

  // Save wishlistIds and customItems to AsyncStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    async function saveWishlist() {
      try {
        await AsyncStorage.setItem('@wishlist_ids', JSON.stringify(wishlistIds));
        await AsyncStorage.setItem('@wishlist_meta', JSON.stringify(customItems));
      } catch (e) {
        console.warn('Failed to save wishlist to AsyncStorage:', e);
      }
    }
    saveWishlist();
  }, [wishlistIds, customItems, isInitialized]);

  // Sync with API in background (only adopt if items exist)
  const syncWishlist = useCallback(async () => {
    if (!user || isGuest) return;
    try {
      const res = await withTimeout(getWishlist(), 2000);
      const list = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      const ids = list.map((item) => item?.productId || item?.id || item).filter(Boolean);
      if (ids.length > 0) {
        setWishlistIds((prev) => Array.from(new Set([...(Array.isArray(prev) ? prev : []), ...ids])));
      }
    } catch (e) {
      console.warn('GET /api/wishlist failed. Operating in offline/mock mode.', e.message);
    }
  }, [user, isGuest]);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  const isLiked = useCallback(
    (productId) => {
      const safeList = Array.isArray(wishlistIds) ? wishlistIds : [];
      return safeList.some((id) => String(id) === String(productId));
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId, customProductData = null) => {
      if (!productId) return;
      const safeList = Array.isArray(wishlistIds) ? wishlistIds : [];
      const isCurrentlyLiked = safeList.some((id) => String(id) === String(productId));

      if (isCurrentlyLiked) {
        setWishlistIds((prev) => (Array.isArray(prev) ? prev : []).filter((id) => String(id) !== String(productId)));
        setCustomItems((prev) => {
          const next = { ...(prev || {}) };
          delete next[productId];
          return next;
        });
      } else {
        // Clear from removed list in AsyncStorage if present
        try {
          const storedRemoved = await AsyncStorage.getItem('@removed_wishlist_ids');
          if (storedRemoved) {
            const removedArr = JSON.parse(storedRemoved);
            if (Array.isArray(removedArr)) {
              const filtered = removedArr.filter((id) => String(id) !== String(productId));
              await AsyncStorage.setItem('@removed_wishlist_ids', JSON.stringify(filtered));
            }
          }
        } catch (e) {
          console.warn('Failed to clear removed wishlist id:', e);
        }

        setWishlistIds((prev) => [...(Array.isArray(prev) ? prev : []), productId]);
        if (customProductData) {
          setCustomItems((prev) => ({
            ...(prev || {}),
            [productId]: customProductData,
          }));
        }
      }

      // Background API sync
      try {
        if (isCurrentlyLiked) {
          await withTimeout(removeFromWishlist(productId), 2000);
        } else {
          await withTimeout(addToWishlist(productId), 2000);
        }
      } catch (e) {
        console.warn(`Wishlist API sync failed for product ${productId}. Saving changes locally.`, e.message);
      }
    },
    [wishlistIds]
  );

  // Map wishlist IDs to full product objects with complete category and isBooking info
  const wishlistItems = useMemo(() => {
    const safeIds = Array.isArray(wishlistIds) ? wishlistIds : [];
    const safeCustom = customItems && typeof customItems === 'object' ? customItems : {};
    return safeIds
      .map((id) => {
        if (!id) return null;
        if (safeCustom[id]) {
          const c = safeCustom[id];
          const isBooking = !!(
            c.isBooking ||
            c.categoryId === 'cat_services' ||
            c.categoryId === 'cat_food' ||
            (typeof c.category === 'string' &&
              (c.category.toLowerCase().includes('service') || c.category.toLowerCase().includes('food')))
          );
          return {
            ...c,
            id: String(c.id || id),
            isBooking,
          };
        }

        const allProducts = [...(ALL_FEED_PRODUCTS || []), ...(mockProducts || [])];
        const found = allProducts.find((p) => String(p?.id) === String(id));
        if (found) {
          const isBooking = !!(
            found.isBooking ||
            found.categoryId === 'cat_services' ||
            found.categoryId === 'cat_food' ||
            (typeof found.category === 'string' &&
              (found.category.toLowerCase().includes('service') || found.category.toLowerCase().includes('food')))
          );
          return {
            ...found,
            id: String(found.id),
            isBooking,
          };
        }

        const resolved = resolveProduct(id);
        if (resolved) {
          return resolved;
        }

        return null;
      })
      .filter(Boolean);
  }, [wishlistIds, customItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: Array.isArray(wishlistItems) ? wishlistItems : [],
        wishlistIds: Array.isArray(wishlistIds) ? wishlistIds : [],
        isLiked,
        toggleWishlist,
        loading,
        refreshWishlist: syncWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
