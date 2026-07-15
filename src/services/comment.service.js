import api from './api';

export const commentService = {
  createComment: (data) => api.post('/comments', data),
  getComments: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};
