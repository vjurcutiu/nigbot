import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,  // to send session cookie
});

// Function to fetch CSRF token from backend and set it in axios headers
export async function setCSRFToken() {
  try {
    const response = await axios.get('http://localhost:5000/api/csrf-token', { withCredentials: true });
    const csrfToken = response.data.csrf_token;
    if (csrfToken) {
      api.defaults.headers.common['X-CSRFToken'] = csrfToken;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

export default api;
