import api from './api';

export const analyticsService = {
  trackVisit: (path) => api.post('/analytics/track', { path }),
  getOverview: () => api.get('/analytics/overview'),
  getDailyUsers: (days = 30) => api.get(`/analytics/daily-users?days=${days}`),
  getMonthlyUsers: (months = 12) => api.get(`/analytics/monthly-users?months=${months}`),
  getActiveSessions: () => api.get('/analytics/active-sessions'),
  getPopularReels: (params) => api.get('/analytics/popular-reels', { params }),
  getPopularMemories: (params) => api.get('/analytics/popular-memories', { params }),
  getCommunityGrowth: (months = 12) => api.get(`/analytics/community-growth?months=${months}`),
};
