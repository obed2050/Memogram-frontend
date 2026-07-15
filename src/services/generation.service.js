import api from './api';

export const generationService = {
  getMyGenerations: () => api.get('/generations/my'),
  getGeneration: (schoolId, generation) =>
    api.get(`/generations/${schoolId}/${encodeURIComponent(generation)}`),
  getMembers: (schoolId, generation, params) =>
    api.get(`/generations/${schoolId}/${encodeURIComponent(generation)}/members`, { params }),
  getPosts: (schoolId, generation, params) =>
    api.get(`/generations/${schoolId}/${encodeURIComponent(generation)}/posts`, { params }),
  getMemories: (schoolId, generation, params) =>
    api.get(`/generations/${schoolId}/${encodeURIComponent(generation)}/memories`, { params }),
  getDiscussions: (schoolId, generation, params) =>
    api.get(`/generations/${schoolId}/${encodeURIComponent(generation)}/discussions`, { params }),
  createDiscussion: (schoolId, generation, data) =>
    api.post(`/generations/${schoolId}/${encodeURIComponent(generation)}/discussions`, data),
  getDiscussion: (discussionId) => api.get(`/generations/discussions/${discussionId}`),
  deleteDiscussion: (discussionId) => api.delete(`/generations/discussions/${discussionId}`),
  getReplies: (discussionId, params) =>
    api.get(`/generations/discussions/${discussionId}/replies`, { params }),
  createReply: (discussionId, data) =>
    api.post(`/generations/discussions/${discussionId}/replies`, data),
  deleteReply: (discussionId, replyId) => api.delete(`/generations/discussions/${discussionId}/replies/${replyId}`),
};
