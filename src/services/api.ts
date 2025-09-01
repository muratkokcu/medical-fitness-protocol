import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    role?: string;
  }) => api.post('/auth/register', data),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    organization: string;
  }) => api.put('/auth/profile', data),
};

export const clientAPI = {
  getClients: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get('/clients', { params }),
  
  getClient: (id: string) => api.get(`/clients/${id}`),
  
  createClient: (data: any) => api.post('/clients', data),
  
  updateClient: (id: string, data: any) => api.put(`/clients/${id}`, data),
  
  deleteClient: (id: string) => api.delete(`/clients/${id}`),
  
  getClientStats: () => api.get('/clients/stats'),
};

export const assessmentAPI = {
  getAssessments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get('/assessments', { params }),
  
  getAssessment: (id: string) => api.get(`/assessments/${id}`),
  
  createAssessment: (data: any) => api.post('/assessments', data),
  
  updateAssessment: (id: string, data: any) => api.put(`/assessments/${id}`, data),
  
  deleteAssessment: (id: string) => api.delete(`/assessments/${id}`),
  
  getAssessmentStats: () => api.get('/assessments/stats'),
};

export default api;