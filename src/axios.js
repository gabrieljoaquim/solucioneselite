import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
});

// Add a request interceptor to include JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
