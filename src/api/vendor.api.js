import client from './client';

export const getVendor = (id) => client.get(`/vendor/${id}`);
export const getVendorProducts = (id) => client.get(`/vendor/${id}/products`);
export const getVendorReviews = (id) => client.get(`/vendor/${id}/reviews`);

export const registerVendor = (payload) =>
  client.post('/vendor/register', payload);

export const updateVendorProfile = (payload) =>
  client.put('/vendor/profile', payload);

export const uploadVendorDocument = (formData) => {
  return client.post('/upload/vendor', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getVendorDashboard = () => client.get('/vendor/dashboard');
export const getVendorOrders = () => client.get('/vendor/orders');

// 31. Vendor Products
export const createVendorProduct = (payload) => client.post('/vendor/products', payload);
export const updateVendorProduct = (id, payload) => client.put(`/vendor/products/${id}`, payload);
export const deleteVendorProduct = (id) => client.delete(`/vendor/products/${id}`);
export const uploadProductImages = (formData) => {
  return client.post('/vendor/products/upload-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const acceptVendorOrder = (id) =>
  client.put(`/orders/status/${id}`, { status: 'CONFIRMED' });
export const dispatchVendorOrder = (id) =>
  client.put(`/orders/status/${id}`, { status: 'SHIPPED' });
export const deliverVendorOrder = (id) =>
  client.put(`/orders/status/${id}`, { status: 'DELIVERED' });

// Merchant Earnings & Payouts
export const getVendorEarnings = () => client.get('/v1/merchant/earnings');
export const getVendorPayouts = (params) => client.get('/v1/merchant/payouts', { params });
export const requestVendorPayout = (amount) => client.post('/v1/merchant/payouts', { amount });
