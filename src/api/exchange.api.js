import client from './client';

export const createExchangeRequest = (payload) => client.post('/exchange/request', payload);
export const getExchangeRequests = () => client.get('/exchange');
export const cancelExchangeRequest = (id) => client.put(`/exchange/cancel/${id}`);
