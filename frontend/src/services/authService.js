import api, { setCSRFToken } from './api';

const authService = {
  async login(username, password) {
    // Refresh CSRF token before login
    await setCSRFToken();
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },

  async signup(userData) {
    // Refresh CSRF token before signup
    await setCSRFToken();
    const res = await api.post('/auth/signup', userData);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    // Refresh CSRF token after logout
    await setCSRFToken();
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
