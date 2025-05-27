import api from './api';

const authService = {
  async logout() {
    const res = await api.post('/logout');
    return res.data;
  },
};

export default authService;
