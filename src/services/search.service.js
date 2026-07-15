import api from './api';

export const searchService = {
  search: (params) => api.get('/search', { params }),
};
