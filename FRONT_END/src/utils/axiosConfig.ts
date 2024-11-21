import axios from 'axios';

// Thiết lập interceptor cho Axios mặc định
axios.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage mỗi khi request được gửi
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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
