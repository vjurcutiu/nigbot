// src/services/candidateService.js
import api from '../api';

const candidateService = {
  // 1) Dashboard data
  async getDashboard() {
    const res = await api.get('/candidate/');
    return res.data; // { message: "Welcome to the candidate dashboard" }
  },

  // 2) Profile retrieval
  async getProfile() {
    const res = await api.get('/candidate/profile');
    return res.data.profile; // {}
  },

  // 3) Submit a new job application
  //    application should be an object matching your backend shape
  async applyJob(application) {
    const res = await api.post('/candidate/apply', application);
    return res.data; // { status: "Application submitted", application: {…} }
  },

  // 4) List all existing applications
  async listApplications() {
    const res = await api.get('/candidate/applications');
    return res.data.applications; // [ { position, company, date_applied }, … ]
  },

  // 5) Fetch full candidate data by ID
  async getFull(candidateId) {
    const res = await api.get(`/candidate/${candidateId}/full`);
    return res.data; 
    /* {
         profile: { id, user_id, full_name, … },
         employments: [ { id, company_name, … }, … ],
         documents: [ … ],
         applications: [ … ],
         skills: [ … ],
         educations: [ … ]
       }
    */
  },

  // 6) Partially update candidate (profile + sections)
  //    data can contain keys: profile, employments, documents, applications, skills, educations
  async updateFull(candidateId, data) {
    const res = await api.patch(`/candidate/${candidateId}/full`, data);
    return res.data; // { status: "success" }
  },
};

export default candidateService;
