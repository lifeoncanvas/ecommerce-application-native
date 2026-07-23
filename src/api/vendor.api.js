import client from './client';

export const getVendor = (id) => client.get(`/vendor/${id}`);
export const getVendorProducts = (id) => client.get(`/vendor/${id}/products`);
export const getVendorReviews = (id) => client.get(`/vendor/${id}/reviews`);

export const registerVendor = (payload) =>
  client.post('/vendor/register', payload);

export const getVendorDashboard = () => client.get('/vendor/dashboard');
export const getVendorOrders = () => client.get('/vendor/orders');
export const acceptVendorOrder = (id) =>
  client.put(`/vendor/orders/${id}/accept`);
export const dispatchVendorOrder = (id) =>
  client.put(`/vendor/orders/${id}/dispatch`);
export const deliverVendorOrder = (id) =>
  client.put(`/vendor/orders/${id}/delivered`);
