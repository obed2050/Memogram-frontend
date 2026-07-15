import api from './api';

export const recommendationService = {
  getRecommendations: (params) => api.get('/recommendations', { params }),
  getSimilarPosts: (postId, params) => api.get(`/recommendations/similar/${postId}`, { params }),
  trackInteraction: (postId, type, metadata) => api.post(`/recommendations/interact/${postId}`, { type, ...metadata }),
  autoTag: (postId, content) => api.post(`/recommendations/tag/${postId}`, { content }),
  getStats: () => api.get('/recommendations/stats'),
};
