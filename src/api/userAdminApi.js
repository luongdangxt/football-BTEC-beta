import axiosClient from './axiosClient';

const userAdminApi = {
  getAll() {
    return axiosClient.get('/auth/users');
  },
  lock(userId, active) {
    return axiosClient.put(`/auth/users/${userId}/lock`, { active });
  },
  delete(userId) {
    return axiosClient.delete(`/auth/users/${userId}`);
  },
};

export default userAdminApi;
