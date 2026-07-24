import client from './client';

export const getPrivacyPolicy = () => client.get('/content/privacy-policy');
export const getTermsAndConditions = () => client.get('/content/terms');
export const getContactInfo = () => client.get('/content/contact');
export const submitContactForm = (payload) => client.post('/contact', payload);
