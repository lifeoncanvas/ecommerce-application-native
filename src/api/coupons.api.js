import client from './client';

export const getCoupons = () => client.get('/coupons');
export const applyCoupon = (code) => client.post('/cart/apply-coupon', { code });
