import axios from 'axios';
import type { 
  ApiResponse, 
  Client, 
  Assessment, 
  ClientsResponse, 
  AssessmentsResponse, 
  ClientStatsResponse, 
  AssessmentStatsResponse,
  AssessmentData
} from '../types/assessment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  }): Promise<ApiResponse<ClientsResponse>> => api.get('/clients', { params }),
  
  getClient: (id: string): Promise<ApiResponse<Client>> => api.get(`/clients/${id}`),
  
  createClient: (data: Partial<Client>): Promise<ApiResponse<Client>> => api.post('/clients', data),
  
  updateClient: (id: string, data: Partial<Client>): Promise<ApiResponse<Client>> => api.put(`/clients/${id}`, data),
  
  deleteClient: (id: string): Promise<ApiResponse<void>> => api.delete(`/clients/${id}`),
  
  getClientStats: (): Promise<ApiResponse<ClientStatsResponse>> => api.get('/clients/stats'),
};

export const assessmentAPI = {
  getAssessments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<AssessmentsResponse>> => api.get('/assessments', { params }),
  
  getAssessment: (id: string): Promise<ApiResponse<Assessment>> => api.get(`/assessments/${id}`),
  
  createAssessment: (data: Partial<Assessment> & { data: AssessmentData }): Promise<ApiResponse<Assessment>> => api.post('/assessments', data),
  
  updateAssessment: (id: string, data: Partial<Assessment>): Promise<ApiResponse<Assessment>> => api.put(`/assessments/${id}`, data),
  
  deleteAssessment: (id: string): Promise<ApiResponse<void>> => api.delete(`/assessments/${id}`),
  
  getAssessmentStats: (): Promise<ApiResponse<AssessmentStatsResponse>> => api.get('/assessments/stats'),
};

export default api;