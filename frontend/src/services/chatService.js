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
    try {
      const res = await api.get(`/users/${userId}`);
      this.userCache.set(userId, res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  }

  getDisplayName(user) {
    if (!user) return 'Unknown';
    if (user.id === this.currentUserId) return 'You';
    return user.name || user.username || 'Unknown';
  }
}

const chatService = new ChatService();
export default chatService;
