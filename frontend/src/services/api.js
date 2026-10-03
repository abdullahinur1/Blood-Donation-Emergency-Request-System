import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Donor Services
export const donorService = {
  getProfile: () => api.get('/donors/profile'),
  updateProfile: (data) => api.put('/donors/profile', data),
  toggleAvailability: (data) => api.patch('/donors/availability', data),
  searchDonors: (params) => api.get('/donors/search', { params }),
  getCompatibleRequests: () => api.get('/donors/compatible-requests'),
  pledgeToRequest: (requestId, data) => api.post(`/donors/pledge/${requestId}`, data),
};

// Blood Request Services
export const requestService = {
  getRequests: (params) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  createRequest: (data) => api.post('/requests', data),
  updateStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
  verifyRequest: (id) => api.patch(`/requests/${id}/verify`),
  allocateUnits: (id, data) => api.post(`/requests/${id}/allocate`, data),
};

// Blood Inventory Services
export const inventoryService = {
  getInventory: (params) => api.get('/inventory', { params }),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  adjustStock: (data) => api.post('/inventory/adjust', data),
};

// Donation Services
export const donationService = {
  getMyDonations: () => api.get('/donations/my'),
  getAllDonations: (params) => api.get('/donations', { params }),
  recordDonation: (data) => api.post('/donations', data),
};

// Hospital & Blood Bank Services
export const hospitalService = {
  getHospitals: (params) => api.get('/hospitals', { params }),
  getHospitalById: (id) => api.get(`/hospitals/${id}`),
  createHospital: (data) => api.post('/hospitals', data),
  updateHospital: (id, data) => api.put(`/hospitals/${id}`, data),
  deleteHospital: (id) => api.delete(`/hospitals/${id}`),
};

// Admin User Management Services
export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),
  toggleUserStatus: (id) => api.patch(`/users/${id}/status`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Notification Services
export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Stats Services
export const statsService = {
  getOverview: () => api.get('/stats/overview'),
};

export default api;
