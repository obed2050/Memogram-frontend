import api from './api';

export const communityService = {
  getMyCommunities: () => api.get('/communities/my'),
  getCommunityBySchool: (schoolId) => api.get(`/communities/${schoolId}`),
  updateCommunity: (schoolId, data) => api.put(`/communities/${schoolId}`, data),
  uploadBanner: (schoolId, formData) => api.put(`/communities/${schoolId}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMembers: (schoolId, params) => api.get(`/communities/${schoolId}/members`, { params }),
  getPosts: (schoolId, params) => api.get(`/communities/${schoolId}/posts`, { params }),
  getMemories: (schoolId, params) => api.get(`/communities/${schoolId}/memories`, { params }),
  getEvents: (schoolId, params) => api.get(`/communities/${schoolId}/events`, { params }),
  createEvent: (schoolId, formData) => api.post(`/communities/${schoolId}/events`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteEvent: (schoolId, eventId) => api.delete(`/communities/${schoolId}/events/${eventId}`),
  browseCommunities: (params) => api.get('/communities/browse', { params }),
};
