import client from './client';

export const getAdminDashboardStats = () => client.get('/admin/dashboard');

export const getAdminUsers = (page = 0, size = 20) => client.get('/admin/users', { params: { page, size } });
export const updateAdminUserStatus = (userId, status) => client.put(`/admin/users/${userId}/status`, null, { params: { status } });

export const getAdminVendors = (page = 0, size = 20) => client.get('/admin/vendors', { params: { page, size } });
export const updateAdminVendorStatus = (vendorId, status) => client.put(`/admin/vendors/${vendorId}/status`, null, { params: { status } });

export const getAdminProducts = (page = 0, size = 20) => client.get('/admin/products', { params: { page, size } });
export const getAdminOrders = (page = 0, size = 20) => client.get('/admin/orders', { params: { page, size } });
export const getAdminPayments = (page = 0, size = 20) => client.get('/admin/payments', { params: { page, size } });
export const getAdminReviews = (page = 0, size = 20) => client.get('/admin/reviews', { params: { page, size } });
export const getAdminReports = () => client.get('/admin/reports');
export const getAdminSettings = () => client.get('/admin/settings');

// Commissions
export const getAdminCommissions = () => client.get('/v1/commissions');
export const updateAdminCommission = (countryCode, rate, description) => client.post(`/v1/commissions/${countryCode}`, { rate, description });

// Payouts
export const getAdminPayouts = (page = 0, size = 20) => client.get('/v1/merchant/admin/payouts', { params: { page, size } });
export const approveAdminPayout = (id) => client.put(`/v1/merchant/admin/payouts/${id}/approve`);
export const processAdminPayout = (id) => client.put(`/v1/merchant/admin/payouts/${id}/process`);
export const failAdminPayout = (id, reason) => client.put(`/v1/merchant/admin/payouts/${id}/fail`, null, { params: { reason } });
