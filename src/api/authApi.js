// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  // Đăng nhập
  login(data) {
    const url = '/auth/login';
    return axiosClient.post(url, data);
  },

  // Đăng ký
  register(data) {
    const url = '/auth/register';
    return axiosClient.post(url, data);
  },

  // Lấy danh sách users (Dành cho Admin sau này)
  getAllUsers() {
    const url = '/auth/users';
    return axiosClient.get(url);
  },
  
  // Khóa user (Admin)
  lockUser(userId, active) {
    const url = `/auth/users/${userId}/lock`;
    return axiosClient.put(url, null, { params: { active } });
  }
};

export default authApi;