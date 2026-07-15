import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUserGrowth: (days = 30) => api.get(`/admin/analytics/users?days=${days}`),
  getContentAnalytics: (days = 30) => api.get(`/admin/analytics/content?days=${days}`),
  getTopUsers: (limit = 10) => api.get(`/admin/analytics/top-users?limit=${limit}`),

  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getPosts: (params) => api.get('/admin/posts', { params }),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),

  getComments: (params) => api.get('/admin/comments', { params }),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),

  getEvents: (params) => api.get('/admin/events', { params }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  getCommunities: (params) => api.get('/admin/communities', { params }),

  getReports: () => api.get('/admin/reports'),

  suspendUser: (id, duration, reason) => api.post(`/moderation/users/${id}/suspend`, { duration, reason }),
  unsuspendUser: (id) => api.post(`/moderation/users/${id}/unsuspend`),

  hideComment: (id, reason) => api.post(`/moderation/comments/${id}/hide`, { reason }),
  unhideComment: (id) => api.post(`/moderation/comments/${id}/unhide`),

  modDeletePost: (id, reason) => api.post(`/moderation/posts/${id}/delete`, { reason }),
  modDeleteComment: (id, reason) => api.post(`/moderation/comments/${id}/delete`, { reason }),
  modDeleteEvent: (id, reason) => api.post(`/moderation/events/${id}/delete`, { reason }),

  getModLogs: (params) => api.get('/moderation/logs', { params }),
  getModStats: () => api.get('/moderation/stats'),
};
