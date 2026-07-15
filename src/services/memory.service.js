import api from './api';

export const memoryService = {
  createMemory: (formData) => api.post('/memories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMemories: (params) => api.get('/memories', { params }),
  getMemoryById: (id) => api.get(`/memories/${id}`),
  deleteMemory: (id) => api.delete(`/memories/${id}`),
  getSchoolMemories: (schoolId, params) => api.get(`/memories/school/${schoolId}`, { params }),
};
