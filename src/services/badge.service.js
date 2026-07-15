import api from './api';

export const badgeService = {
  getMyBadges: () => api.get('/badges/me'),
  getUserBadges: (userId) => api.get(`/badges/${userId}`),
};
