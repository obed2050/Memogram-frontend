import api from './api';

export const albumService = {
  create: (formData) => api.post('/albums', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyAlbums: (params) => api.get('/albums/my', { params }),
  getFeed: (params) => api.get('/albums/feed', { params }),
  getOne: (id) => api.get(`/albums/${id}`),
  update: (id, formData) => api.put(`/albums/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/albums/${id}`),
  addItem: (id, data) => api.post(`/albums/${id}/items`, data),
  removeItem: (id, postId) => api.delete(`/albums/${id}/items/${postId}`),
  reorder: (id, data) => api.put(`/albums/${id}/items/reorder`, data),
};
