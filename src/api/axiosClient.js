// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
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
    // Xử lý lỗi chung
    if (error.response && error.response.status === 401) {
      // Dispatch event để App.jsx bắt được và hiện popup login
      window.dispatchEvent(new CustomEvent("auth:unauthorized", {
        detail: { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }
      }));
      // Có thể clear token luôn nếu muốn
      localStorage.removeItem('token');
    }
    throw error;
  }
);

export default axiosClient;