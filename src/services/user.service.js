import api from './api';

export const userService = {
  getProfile: () => api.get('/users/profile'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePhoto: (formData) => api.put('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadCoverPhoto: (formData) => api.put('/users/profile/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Extended profile
  getExtendedProfile: (userId) => api.get(`/profile/${userId}`),
  updateExtendedProfile: (data) => api.put('/profile', data),
  getUserStats: (userId) => api.get(`/profile/${userId}/stats`),
};
