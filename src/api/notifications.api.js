import client from './client';

export const getNotifications = () => client.get('/notifications');
export const markNotificationRead = (id) => client.put(`/notifications/read/${id}`);
export const markAllNotificationsRead = () => client.put('/notifications/read-all');
