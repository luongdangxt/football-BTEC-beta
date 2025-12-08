// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://api-webbongda.onrender.com', // Đổi port nếu server chạy port khác
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Tự động gắn Token lấy từ LocalStorage
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response: Xử lý dữ liệu trả về cho gọn
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp (bỏ qua bước response.data ở component)
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi chung (ví dụ: hết hạn token thì logout luôn)
    if (error.response && error.response.status === 401) {
       // Logic logout tự động nếu cần
       // localStorage.removeItem('token');
       // window.location.href = '/login'; 
    }
    throw error;
  }
);

export default axiosClient;