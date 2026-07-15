import api from './api';

export const beforeNowService = {
  create: (formData) => api.post('/before-now', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFeed: (params) => api.get('/before-now/feed', { params }),
  getExplore: (params) => api.get('/before-now/explore', { params }),
  getOne: (id) => api.get(`/before-now/${id}`),
  delete: (id) => api.delete(`/before-now/${id}`),

  toggleLike: (id) => api.post(`/before-now/${id}/like`),
  getLikes: (id, params) => api.get(`/before-now/${id}/likes`, { params }),

  getComments: (id, params) => api.get(`/before-now/${id}/comments`, { params }),
  createComment: (id, data) => api.post(`/before-now/${id}/comments`, data),
  deleteComment: (id, commentId) => api.delete(`/before-now/${id}/comments/${commentId}`),
  getReplies: (id, commentId, params) =>
    api.get(`/before-now/${id}/comments/${commentId}/replies`, { params }),
  createReply: (id, commentId, data) =>
    api.post(`/before-now/${id}/comments/${commentId}/replies`, data),
  deleteReply: (replyId) => api.delete(`/before-now/replies/${replyId}`),

  getUserBeforeNows: (userId, params) => api.get(`/before-now/user/${userId}`, { params }),
};
