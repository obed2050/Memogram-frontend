import api from './api';

export const draftService = {
  getDrafts: (params) => api.get('/drafts', { params }),
  getDraft: (id) => api.get(`/drafts/${id}`),
  createDraft: (formData) => api.post('/drafts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateDraft: (id, formData) => api.put(`/drafts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDraft: (id) => api.delete(`/drafts/${id}`),
  publishDraft: (id) => api.post(`/drafts/${id}/publish`),
};
