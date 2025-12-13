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
  getLeaderboard() {
    return axiosClient.get('/api/leaderboard');
  },
  predict(data) {
    return axiosClient.post('/api/predict', data);
  },
  getMyPredictions() {
    return axiosClient.get('/api/predictions/me');
  },
  addEvent(matchId, eventData) {
    return axiosClient.post(`/api/matches/${matchId}/events`, eventData);
  },

  // === TOURNAMENT APIs ===
  // Lấy sơ đồ giải đấu đầy đủ
  getTournament() {
    return axiosClient.get('/api/tournament');
  },

  // Lấy bảng xếp hạng các bảng đấu
  getStandings() {
    return axiosClient.get('/api/standings');
  },

  // Lấy trận đấu theo vòng (group, semi, quarter, final)
  getMatchesByStage(stage) {
    return axiosClient.get(`/api/matches/stage/${stage}`);
  },

  // Lấy trận đấu theo bảng (A, B, C, D)
  getMatchesByGroup(group) {
    return axiosClient.get(`/api/matches/group/${group}`);
  }
};

export default matchApi;
