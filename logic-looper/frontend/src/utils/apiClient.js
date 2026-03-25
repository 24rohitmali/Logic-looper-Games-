import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// User endpoints
export const userAPI = {
  register: (email, name) => api.post('/users/register', { email, name }),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateStreak: (userId, streak) => api.post(`/users/${userId}/streak`, { streak }),
  addPoints: (userId, points) => api.post(`/users/${userId}/points`, { points })
};

// Score endpoints
export const scoreAPI = {
  saveScore: (scoreData) => api.post('/scores', scoreData),
  getDailyScore: (userId, date) => api.get(`/scores/${userId}/${date}`),
  getLeaderboard: (date, limit = 100) => api.get(`/scores/leaderboard/${date}?limit=${limit}`),
  getUserStats: (userId) => api.get(`/scores/stats/${userId}`),
  updateStats: (userId, statsData) => api.post(`/scores/stats/${userId}`, statsData)
};

export default api;
