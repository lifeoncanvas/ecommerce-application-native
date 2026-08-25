import client from './client';

export const getHome = () => client.get('/home');
export const getBanners = () => client.get('/home/banners');
export const getFeatured = () => client.get('/home/featured');
export const getFlashSale = () => client.get('/home/flash-sale');
export const getHomeCategories = () => client.get('/home/categories');
export const getHomeLatest = () => client.get('/home/latest');
export const getHomePopular = () => client.get('/home/popular');
export const getHomeRecommended = () => client.get('/home/recommended');

export const getProducts = (page = 1) => client.get(`/products?page=${page}`);
export const getProductsByCategory = (categoryId) =>
  client.get(`/products/category/${categoryId}`);
export const getProductsByVendor = (vendorId) =>
  client.get(`/products/vendor/${vendorId}`);
export const getFilteredProducts = (params) =>
  client.get('/products/filter', { params });
export const getProductDetails = (id) => client.get(`/products/${id}`);
export const getProductReviews = (id) => client.get(`/products/${id}/reviews`);
export const getRelatedProducts = (id) => client.get(`/products/${id}/related`);

export const searchProducts = (query) =>
  client.get('/search', { params: { q: query } });
export const getSearchSuggestions = (query) =>
  client.get('/search/suggestions', { params: { q: query } });
export const getSearchFilters = () =>
  client.get('/search/filter');
export const getSearchHistory = () =>
  client.get('/search/history');

export const getCategories = () => client.get('/categories');
export const getCategoryDetails = (id) => client.get(`/categories/${id}`);
export const getCategoryProducts = (id) => client.get(`/categories/${id}/products`);

// Store Portal Product & Audit Endpoints
export const getStoreProducts = (storeId) => client.get(`/stores/${storeId}/products`);
export const createStoreProduct = (storeId, payload) => client.post(`/stores/${storeId}/products`, payload);
export const createMyStoreProduct = (payload, email) => client.post('/stores/my-store/products', payload, { params: { email } });
export const updateProduct = (id, payload) => client.put(`/products/${id}`, payload);
export const toggleProductStatus = (id, active) => client.patch(`/products/${id}/status`, null, { params: { active } });
export const getStoreActivities = (email) => client.get('/stores/my-store/activities', { params: { email } });
export const deleteProduct = (id) => client.delete(`/products/${id}`);

