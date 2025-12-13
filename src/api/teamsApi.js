import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const teamsApi = {
    // Get all teams (public)
    getAll: async () => {
        const res = await axios.get(`${BASE_URL}/api/teams`);
        return res.data;
    },

    // Create team (admin only)
    create: async (data) => {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${BASE_URL}/api/teams`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // Update team (admin only)
    update: async (id, data) => {
        const token = localStorage.getItem("token");
        const res = await axios.put(`${BASE_URL}/api/teams/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // Delete team (admin only)
    delete: async (id) => {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`${BASE_URL}/api/teams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
};

export default teamsApi;
