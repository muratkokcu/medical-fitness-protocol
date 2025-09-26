import axios from 'axios';
import type {
  ApiResponse,
  Client,
  ClientsResponse,
  ClientStatsResponse,
  ClientResponse
} from '@medical-fitness/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data?.success ? 'Success' : response.data,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🚪 Redirecting to login due to 401 error');
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
  }): Promise<ApiResponse<ClientsResponse>> => {
    console.log('📋 Getting clients with params:', params);
    return api.get('/clients', { params });
  },

  getClient: (id: string): Promise<ClientResponse> => {
    console.log('👤 Getting client with ID:', id);
    return api.get(`/clients/${id}`);
  },

  createClient: (data: Partial<Client>): Promise<ClientResponse> => {
    console.log('➕ Creating client with data:', {
      fullName: data.fullName,
      company: data.company,
      hasEmail: !!data.email,
      hasPhone: !!data.phone
    });
    return api.post('/clients', data);
  },

  updateClient: (id: string, data: Partial<Client>): Promise<ClientResponse> => {
    console.log('✏️ Updating client:', id, 'with data:', data);
    return api.put(`/clients/${id}`, data);
  },

  deleteClient: (id: string): Promise<ApiResponse<void>> => {
    console.log('🗑️ Deleting client:', id);
    return api.delete(`/clients/${id}`);
  },

  getClientStats: (): Promise<ApiResponse<ClientStatsResponse>> => {
    console.log('📊 Getting client stats');
    return api.get('/clients/stats');
  },
};

export const assessmentAPI = {
  createInvitation: (data: any): Promise<ApiResponse<any>> => {
    console.log('🎫 Creating assessment invitation');
    return api.post('/invitations', data);
  },

  getInvitations: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> => {
    console.log('📋 Getting invitations with params:', params);
    return api.get('/invitations', { params });
  },

  getInvitationStats: (): Promise<ApiResponse<any>> => {
    console.log('📊 Getting invitation stats');
    return api.get('/invitations/stats/overview');
  },

  resendInvitation: (id: string): Promise<ApiResponse<any>> => {
    console.log('📧 Resending invitation:', id);
    return api.post(`/invitations/${id}/resend`);
  },

  cancelInvitation: (id: string): Promise<ApiResponse<any>> => {
    console.log('❌ Cancelling invitation:', id);
    return api.delete(`/invitations/${id}`);
  },
};

export default api;