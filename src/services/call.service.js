import api from './api';

export const callService = {
  getCallHistory: (params) => api.get('/calls/history', { params }),
  getMissedCalls: () => api.get('/calls/missed'),
};
