import client from './client';

export const getStores = () => client.get('/stores');
export const getStoreById = (id) => client.get(`/stores/${id}`);
export const getMyStore = (email) => client.get('/stores/my-store', { params: { email } });
export const updateStore = (id, payload) => client.put(`/stores/${id}`, payload);
