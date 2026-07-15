import api from './api';

export const savedItemService = {
  getSaved: (params) => api.get('/saved', { params }),
  save: (itemType, itemId) => api.post('/saved', { itemType, itemId }),
  unsave: (itemType, itemId) => api.delete(`/saved/${itemType}/${itemId}`),
  check: (itemType, itemId) => api.get(`/saved/check/${itemType}/${itemId}`),
};
