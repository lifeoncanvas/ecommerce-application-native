import client from './client';

export const getProductReviews = (productId) => client.get(`/reviews/${productId}`);
export const createReview = (payload) => client.post('/reviews', payload);
export const updateReview = (id, payload) => client.put(`/reviews/${id}`, payload);
export const deleteReview = (id) => client.delete(`/reviews/${id}`);
