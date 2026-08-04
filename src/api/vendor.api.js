import client from './client';

export const getVendor = (id) => client.get(`/vendor/${id}`);
export const getVendorProducts = (id) => client.get(`/vendor/${id}/products`);
export const getVendorReviews = (id) => client.get(`/vendor/${id}/reviews`);

export const registerVendor = (payload) =>
  client.post('/vendor/register', payload);

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
  client.put(`/vendor/orders/${id}/accept`);
export const dispatchVendorOrder = (id) =>
  client.put(`/vendor/orders/${id}/dispatch`);
export const deliverVendorOrder = (id) =>
  client.put(`/vendor/orders/${id}/delivered`);
