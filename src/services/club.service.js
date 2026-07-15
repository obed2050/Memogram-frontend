import api from './api';

export const clubService = {
  getMyClubs: () => api.get('/clubs/my'),
  getClub: (clubId) => api.get(`/clubs/${clubId}`),
  createClub: (formData) => api.post('/clubs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateClub: (clubId, formData) => api.put(`/clubs/${clubId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteClub: (clubId) => api.delete(`/clubs/${clubId}`),
  toggleMembership: (clubId) => api.post(`/clubs/${clubId}/join`),
  getMembers: (clubId, params) => api.get(`/clubs/${clubId}/members`, { params }),
  getFeed: (clubId, params) => api.get(`/clubs/${clubId}/feed`, { params }),
  getPhotos: (clubId, params) => api.get(`/clubs/${clubId}/photos`, { params }),
  getVideos: (clubId, params) => api.get(`/clubs/${clubId}/videos`, { params }),
  getEvents: (clubId, params) => api.get(`/clubs/${clubId}/events`, { params }),
  createEvent: (clubId, formData) => api.post(`/clubs/${clubId}/events`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  browseClubs: (params) => api.get('/clubs/browse', { params }),
};
