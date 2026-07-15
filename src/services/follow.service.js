import api from './api';

export const followService = {
  toggleFollow: (userId) => api.post(`/follows/toggle/${userId}`),
  getFollowers: (userId, params) => api.get(`/follows/followers/${userId}`, { params }),
  getFollowing: (userId, params) => api.get(`/follows/following/${userId}`, { params }),
  getFollowCounts: (userId) => api.get(`/follows/counts/${userId}`),
};
