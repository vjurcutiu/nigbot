// src/services/clientService.js
import api from './api';

const clientService = {
  // 1) Client dashboard
  async getDashboard() {
    const res = await api.get('/client/');
    return { id: res.data.companyId, ...res.data };
  },

  // 2) Retrieve client data
  async getData() {
    const res = await api.get('/client/data');
    return res.data.data; // []
  },

  // 3) Perform an action
  async performAction(payload) {
    const res = await api.post('/client/action', payload);
    return res.data; // { status: "Action received", payload: {…} }
  },

  // 4) Fetch full company info by ID (including job positions)
  async getCompany(companyId) {
    const res = await api.get(`/client/${companyId}`);
    return res.data; /* {
       id, user_id, name, bio, profile_picture, website, industry,
       size, founded_date, address, city, country, latitude, longitude,
       contact_email, contact_phone, created_at, updated_at,
       job_positions: [ { id, title, …, posted_at, expires_at }, … ]
    } */
  },

  // 5) Partially update a company
  //    data may include any of the updatable fields:
  //    name, bio, profile_picture, website, industry, size,
  //    founded_date (YYYY-MM-DD), address, city, country,
  //    latitude, longitude, contact_email, contact_phone
  async updateCompany(companyId, data) {
    const res = await api.patch(`/client/${companyId}`, data);
    return res.data; /* {
       id, name, bio, …, contact_phone, created_at, updated_at
    } */
  },
};

export default clientService;
