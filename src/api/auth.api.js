import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

export const loginWithGoogle = (idToken) =>
  client.post('/auth/google', { idToken });

export const loginWithApple = (identityToken) =>
  client.post('/auth/apple', { identityToken });

export const loginWithFacebook = (accessToken) =>
  client.post('/auth/facebook', { accessToken });

export const register = (payload) =>
  client.post('/auth/register', payload);

export const sendOtp = (email) =>
  client.post('/auth/send-otp', { email });

export const verifyOtp = (email, otp) =>
  client.post('/auth/verify-otp', { email, otp });

export const resendOtp = (email) =>
  client.post('/auth/resend-otp', { email });

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  client.post('/auth/reset-password', { token, newPassword });

export const logout = () => client.post('/auth/logout');
