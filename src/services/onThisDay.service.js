import api from './api';

export const onThisDayService = {
  getMemories: () => api.get('/on-this-day'),
};
