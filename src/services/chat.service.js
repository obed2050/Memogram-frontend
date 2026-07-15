import api from './api';

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getOrCreateConversation: (userId) => api.post('/chat/conversations', { userId }),
  getMessages: (conversationId, params) => api.get(`/chat/messages/${conversationId}`, { params }),
  markAsRead: (conversationId) => api.put(`/chat/messages/read/${conversationId}`),
  editMessage: (messageId, content) => api.put(`/chat/messages/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  searchMessages: (conversationId, params) => api.get(`/chat/messages/${conversationId}/search`, { params }),
  uploadMedia: (formData) => api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  toggleReaction: (messageId, emoji) => api.post(`/chat/messages/${messageId}/reaction`, { emoji }),
  forwardMessage: (messageId, conversationId) => api.post(`/chat/messages/${messageId}/forward`, { conversationId }),
  uploadVoice: (formData) => api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
