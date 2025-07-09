import axios from 'axios';

// Configurar la URL base según el entorno
const getBaseURL = () => {
  // En desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:5001/servilinkstore-8f04c/us-central1/api';
  }
  
  // En producción
  return 'https://us-central1-servilinkstore-8f04c.cloudfunctions.net/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debugging
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;