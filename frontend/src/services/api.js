import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('fitai_token');
        localStorage.removeItem('fitai_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  resetDemo: () => api.post('/auth/reset-demo'),
};

export const dashboardApi = {
  getDashboardData: () => api.get('/dashboard'),
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

export const nutritionApi = {
  getNutrition: (date) => api.get('/nutrition', { params: { date } }),
  addFoodEntry: (entry) => api.post('/nutrition', entry),
  deleteFoodEntry: (id) => api.delete(`/nutrition/${id}`),
  updateWater: (amountMl) => api.post('/nutrition/water', { amountMl }),
};

export const workoutApi = {
  getWorkouts: () => api.get('/workouts'),
  createWorkout: (workout) => api.post('/workouts', workout),
  updateWorkout: (id, workout) => api.put(`/workouts/${id}`, workout),
  toggleExercise: (id, exerciseIndex, completed) =>
    api.post(`/workouts/${id}/toggle-exercise`, { exerciseIndex, completed }),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
};

export const progressApi = {
  getProgress: (limit = 30) => api.get('/progress', { params: { limit } }),
  addProgressEntry: (data) => api.post('/progress', data),
  simulateWhatIf: (calories) => api.post('/progress/simulate', { calories }),
};

export const healthApi = {
  getHealthReadings: (limit = 20) => api.get('/health/readings', { params: { limit } }),
  sendSensorReading: (reading) => api.post('/sensors/reading', reading),
  simulateEvent: (action) => api.post('/health/simulate-event', { action }),
};

export const aiApi = {
  chat: (message) => api.post('/ai/chat', { message }),
  getHistory: () => api.get('/ai/chat/history'),
  clearHistory: () => api.delete('/ai/chat'),
  generateMealPlan: (params) => api.post('/ai/meal-plan', params),
  generateWorkout: (params) => api.post('/ai/workout', params),
};

export const mlApi = {
  predictCalories: (inputs) => api.post('/ml/predict', inputs),
  getModelInfo: () => api.get('/ml/model-info'),
};

export default api;
