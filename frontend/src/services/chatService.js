import api from './api';
import authService from './authService';

class ChatService {
  constructor() {
    this.userCache = new Map();
    this.currentUserId = null;
  }

  async init() {
    const currentUser = await authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
  }

  async getUser(userId) {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }
    // Fallback to fetch individual user if needed
    try {
      const res = await api.get(`/users/${userId}`);
      this.userCache.set(userId, res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  }

  async getParticipants(conversationId) {
    if (this.participantCache && this.participantCache[conversationId]) {
      return this.participantCache[conversationId];
    }
    try {
      const res = await api.get(`/conversations/${conversationId}/participants`);
      if (!this.participantCache) this.participantCache = {};
      this.participantCache[conversationId] = res.data.reduce((map, p) => {
        map[p.user_id] = p.display_name;
        return map;
      }, {});
      return this.participantCache[conversationId];
    } catch (err) {
      console.error('Failed to fetch conversation participants:', err);
      return {};
    }
  }

  getDisplayNameFromMap(userId, participantMap) {
    if (!participantMap) return 'Unknown';
    if (userId === this.currentUserId) return 'You';
    return participantMap[userId] || 'Unknown';
  }

  getDisplayName(user) {
    if (!user) return 'Unknown';
    if (user.id === this.currentUserId) return 'You';
    return user.name || user.username || 'Unknown';
  }
}

const chatService = new ChatService();
export default chatService;
