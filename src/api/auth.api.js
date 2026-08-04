import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

export const loginWithGoogle = (idToken) =>
  client.post('/auth/google', { idToken, provider: 'GOOGLE' });

export const loginWithApple = (identityToken) =>
  client.post('/auth/apple', { idToken: identityToken, provider: 'APPLE' });

export const loginWithFacebook = (accessToken) =>
  client.post('/auth/facebook', { idToken: accessToken, provider: 'FACEBOOK' });

export const loginWithKingschat = (accessToken) =>
  client.post('/auth/kingschat', { idToken: accessToken, provider: 'LOCAL' }); // Mapping accessToken to idToken to match SocialLoginRequest


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
