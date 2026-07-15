import api from './api';

export const exploreService = {
  getExplore: () => api.get('/explore'),
};
