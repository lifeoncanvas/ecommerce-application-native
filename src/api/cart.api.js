import client from './client';

export const getCart = () => client.get('/cart');
export const addToCart = (productId, quantity = 1) =>
  client.post('/cart/add', { productId, quantity });
export const updateCartItem = (itemId, quantity) =>
  client.put('/cart/update', { itemId, quantity });
export const removeCartItem = (itemId) =>
  client.delete(`/cart/remove/${itemId}`);
export const clearCart = () => client.delete('/cart/clear');
export const applyCoupon = (code) =>
  client.post('/cart/apply-coupon', { code });

export const getWishlist = () => client.get('/wishlist');
export const addToWishlist = (productId) =>
  client.post('/wishlist', { productId });
export const removeFromWishlist = (id) => client.delete(`/wishlist/${id}`);
