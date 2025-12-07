// [File src/api/adminApi.js]
import axiosClient from './axiosClient';

const adminApi = {
  createMatch(matchData) {
    // Gửi thông tin chuỗi ngày và giờ lên server
    const payload = {
      competition: matchData.competition,
      team_a: matchData.home.name,
      team_a_logo: matchData.home.logo,
      team_a_color: matchData.home.color,
      team_b: matchData.away.name,
      team_b_logo: matchData.away.logo,
      team_b_color: matchData.away.color,
      status: matchData.status,
      minute: matchData.minute,

      // QUAN TRỌNG: Gửi string y nguyên (VD: "2025-01-20" và "05:00")
      date: matchData.date,
      kickoff: matchData.kickoff,
    };

    return axiosClient.post('/api/matches', payload);
  },

  updateMatch(matchId, matchData) {
    const payload = {
      competition: matchData.competition,
      team_a: matchData.home.name,
      team_b: matchData.away.name,
      ...(matchData.status && { status: matchData.status }),
      ...(matchData.minute && { minute: matchData.minute }),
      // Gửi string y nguyên nếu có sửa
      ...(matchData.date && { date: matchData.date }),
      ...(matchData.kickoff && { kickoff: matchData.kickoff }),
    };

    return axiosClient.put(`/api/matches/${matchId}/info`, payload);
  },

  deleteMatch(matchId) {
    return axiosClient.delete(`/api/matches/${matchId}`);
  },

  // ... Các hàm lockMatch, updateScore giữ nguyên ...
  lockMatch(matchId) {
    return axiosClient.put(`/api/matches/${matchId}/lock`);
  },
  updateScore(matchId, a, b) {
    return axiosClient.put(`/api/matches/${matchId}/score`, { score_a: a, score_b: b });
  },
};

export default adminApi;
