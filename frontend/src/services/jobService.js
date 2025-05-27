import api from './api';

const jobService = {
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },
};

export default jobService;
