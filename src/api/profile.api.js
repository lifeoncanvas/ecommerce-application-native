import client from './client';

// 24. User Profile
export const getUserProfile = () => client.get('/users/profile');
export const updateUserProfile = (payload) => client.put('/users/profile', payload);
export const uploadProfileImage = (formData) => {
  return client.post('/upload/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 26. Settings
export const getSettings = () => client.get('/settings');
export const updateSettings = (payload) => client.put('/settings', payload);

// 27. Change Password
export const changePassword = (payload) => client.put('/users/change-password', payload);
