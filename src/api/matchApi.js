import axiosClient from './axiosClient';

const matchApi = {
  // Lấy danh sách tất cả trận đấu
  getAllMatches() {
    return axiosClient.get('/api/matches');
  },
  
  // ... giữ nguyên các hàm cũ getMatchDetail, predict ...
  getMatchDetail(id) {
    return axiosClient.get(`/api/matches/${id}`);
  },
  predict(data) {
    return axiosClient.post('/api/predict', data);
  },
  addEvent(matchId, eventData) {
    return axiosClient.post(`/api/matches/${matchId}/events`, eventData);
  }
};

export default matchApi;