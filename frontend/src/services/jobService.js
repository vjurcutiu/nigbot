import api from './api';

const jobService = {
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  getJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  getJobApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  applyToJob: async (jobId, applicationData) => {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await api.patch(`/jobs/${jobId}`, jobData);
    return response.data;
  },
};

export default jobService;
