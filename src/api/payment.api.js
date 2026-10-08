import client from './client';

export const verifyPayment = (payload) => client.post('/payment/verify', payload);
export const verifyPaystackPayment = (reference) => client.post('/paystack/verify', { reference });

// Payment History (Read-only)
export const getPaymentHistory = () => client.get('/payment/history');
