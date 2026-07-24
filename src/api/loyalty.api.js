import client from './client';

export const getLoyaltyStatus = () => client.get('/loyalty');
export const redeemLoyaltyPoints = (rewardId) => client.post('/loyalty/redeem', { rewardId });
