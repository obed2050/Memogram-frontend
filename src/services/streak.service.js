import api from './api';

export const streakService = {
  getMyStreak: () => api.get('/streaks/me'),
  getUserStreak: (userId) => api.get(`/streaks/${userId}`),
  getLeaderboard: (limit = 20) => api.get(`/streaks/leaderboard?limit=${limit}`),
};
