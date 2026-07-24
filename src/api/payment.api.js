import client from './client';

export const processStripePayment = (payload) => client.post('/payment/stripe', payload);
export const processPaypalPayment = (payload) => client.post('/payment/paypal', payload);
export const processEspeesPayment = (payload) => client.post('/payment/espees', payload);
export const verifyPayment = (payload) => client.post('/payment/verify', payload);
