import axios from 'axios';
import {
  User,
  LostItem,
  WitnessReport,
  FoundItem,
  AIMatch,
  Evidence,
  JourneyResponse,
  Notification,
  DashboardStats,
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lostlink_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  register: async (payload: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

export const lostApi = {
  create: async (formData: FormData) => {
    const res = await apiClient.post<LostItem>('/lost', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAll: async (params?: { category?: string; transport_type?: string; status?: string; query?: string; user_id?: number }) => {
    const res = await apiClient.get<LostItem[]>('/lost', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<LostItem>(`/lost/${id}`);
    return res.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await apiClient.put(`/lost/${id}/status`, { status });
    return res.data;
  },
};

export const witnessApi = {
  create: async (formData: FormData) => {
    const res = await apiClient.post<WitnessReport>('/witness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAll: async (params?: { transport_type?: string; query?: string }) => {
    const res = await apiClient.get<WitnessReport[]>('/witness', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<WitnessReport>(`/witness/${id}`);
    return res.data;
  },
};

export const foundApi = {
  create: async (formData: FormData) => {
    const res = await apiClient.post<FoundItem>('/found', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAll: async (params?: { category?: string; transport_type?: string; status?: string; query?: string }) => {
    const res = await apiClient.get<FoundItem[]>('/found', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<FoundItem>(`/found/${id}`);
    return res.data;
  },
};

export const aiApi = {
  preprocess: async (formData: FormData) => {
    const res = await apiClient.post('/ai/preprocess', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  triggerMatch: async (lostId: number) => {
    const res = await apiClient.post(`/ai/match/${lostId}`);
    return res.data;
  },
  getMatches: async (lostId: number) => {
    const res = await apiClient.get<AIMatch[]>(`/ai/matches/${lostId}`);
    return res.data;
  },
  getAllMatches: async () => {
    const res = await apiClient.get<AIMatch[]>('/ai/all-matches');
    return res.data;
  },
};

export const journeyApi = {
  getJourney: async (lostId: number) => {
    const res = await apiClient.get<JourneyResponse>(`/journey/${lostId}`);
    return res.data;
  },
};

export const evidenceApi = {
  getEvidence: async (lostId: number) => {
    const res = await apiClient.get<Evidence[]>(`/evidence/${lostId}`);
    return res.data;
  },
};

export const verificationApi = {
  submit: async (payload: { match_id: number; decision: string; remarks?: string }) => {
    const res = await apiClient.post('/verification', payload);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/verification');
    return res.data;
  },
};

export const notificationApi = {
  getAll: async () => {
    const res = await apiClient.get<Notification[]>('/notifications');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.put('/notifications/read-all/all');
    return res.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

export const searchApi = {
  search: async (query: string) => {
    const res = await apiClient.get('/search', { params: { q: query } });
    return res.data;
  },
};
