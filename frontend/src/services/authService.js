import api from './api';

const authService = {
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  async signup(userData) {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
