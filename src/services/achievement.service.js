import api from './api';

export const achievementService = {
  getMyAchievements: () => api.get('/achievements/me'),
  getUserAchievements: (userId) => api.get(`/achievements/${userId}`),
  recheckAchievements: () => api.post('/achievements/recheck'),
};
