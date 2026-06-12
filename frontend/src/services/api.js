import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const storedData = localStorage.getItem('loanwise_user') || sessionStorage.getItem('loanwise_user');
  const user = JSON.parse(storedData || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('loanwise_user');
      sessionStorage.removeItem('loanwise_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Profile
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);

// Loans
export const submitLoan = (data) => API.post('/loans', data);
export const getMyLoans = () => API.get('/loans');
export const getLoan = (id) => API.get(`/loans/${id}`);

// EMI
export const calculateEMI = (data) => API.post('/emi/calculate', data);

// Admin
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminApplications = (params) => API.get('/admin/applications', { params });
export const updateApplicationStatus = (id, data) => API.put(`/admin/applications/${id}`, data);

export default API;
