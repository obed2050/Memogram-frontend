import api from './api';

export const guessWhoService = {
  create: (formData) => api.post('/guess-who', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getActive: (params) => api.get('/guess-who/active', { params }),
  getRevealed: (params) => api.get('/guess-who/revealed', { params }),
  getOne: (id) => api.get(`/guess-who/${id}`),
  delete: (id) => api.delete(`/guess-who/${id}`),
  makeGuess: (id, data) => api.post(`/guess-who/${id}/guess`, data),
  getGuesses: (id, params) => api.get(`/guess-who/${id}/guesses`, { params }),
  getMyUploads: (params) => api.get('/guess-who/my-uploads', { params }),
};
