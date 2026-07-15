import api from './api';

export const postService = {
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFeed: (params) => api.get('/posts/feed', { params }),
  getPostById: (id) => api.get(`/posts/${id}`),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
};
