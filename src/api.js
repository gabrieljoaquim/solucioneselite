import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    // Si usas Firebase Auth, puedes obtener el token así:
    try {
      const { getIdToken } = await import('@/firebase/auth');
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
