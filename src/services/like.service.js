import api from './api';

export const likeService = {
  toggleLike: (postId) => api.post(`/likes/toggle/${postId}`),
  getPostLikes: (postId, params) => api.get(`/likes/post/${postId}`, { params }),
};
