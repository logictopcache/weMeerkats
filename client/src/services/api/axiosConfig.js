import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5274',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // If token exists in response, save it
    const token = response.data.token;
    if (token) {
      localStorage.setItem('jwtToken', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 