// utils/axiosConfig.ts
import axios from 'axios';

const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

// Thiết lập interceptor cho Axios mặc định
axios.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
