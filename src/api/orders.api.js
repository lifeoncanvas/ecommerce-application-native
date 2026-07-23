import client from './client';

export const getOrders = () => client.get('/orders');
export const getOrderDetails = (id) => client.get(`/orders/${id}`);
export const cancelOrder = (id) => client.put(`/orders/cancel/${id}`);
export const trackOrder = (id) => client.get(`/orders/tracking/${id}`);
export const createOrder = (payload) => client.post('/orders', payload);

export const getAddresses = () => client.get('/address');
export const addAddress = (payload) => client.post('/address', payload);
export const updateAddress = (id, payload) =>
  client.put(`/address/${id}`, payload);
export const deleteAddress = (id) => client.delete(`/address/${id}`);
export const setDefaultAddress = (id) => client.put(`/address/default/${id}`);
