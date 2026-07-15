import api from './api';

export const eventService = {
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),

  uploadImages: (eventId, formData) => api.post(`/events/${eventId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeImage: (eventId, index) => api.delete(`/events/${eventId}/images/${index}`),

  uploadVideos: (eventId, formData) => api.post(`/events/${eventId}/videos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeVideo: (eventId, index) => api.delete(`/events/${eventId}/videos/${index}`),

  toggleAttendance: (eventId) => api.post(`/events/${eventId}/attend`),
  getAttendees: (eventId, params) => api.get(`/events/${eventId}/attendees`, { params }),

  getComments: (eventId, params) => api.get(`/events/${eventId}/comments`, { params }),
  createComment: (eventId, data) => api.post(`/events/${eventId}/comments`, data),
  deleteComment: (eventId, commentId) => api.delete(`/events/${eventId}/comments/${commentId}`),
  getReplies: (eventId, commentId, params) =>
    api.get(`/events/${eventId}/comments/${commentId}/replies`, { params }),
  createReply: (eventId, commentId, data) =>
    api.post(`/events/${eventId}/comments/${commentId}/replies`, data),
  deleteReply: (replyId) => api.delete(`/events/replies/${replyId}`),

  getLinkedMemories: (eventId, params) => api.get(`/events/${eventId}/memories`, { params }),
  linkMemory: (eventId, memoryId) => api.post(`/events/${eventId}/memories/${memoryId}`),
  unlinkMemory: (eventId, memoryId) => api.delete(`/events/${eventId}/memories/${memoryId}`),
};
