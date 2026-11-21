import { apiRequest } from './api';
import { User } from '../types/pet';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
  has_cat: boolean;
}

interface MeResponse {
  user: User;
  has_cat: boolean;
  cat_summary: {
    id: number;
    name: string;
    gender: string;
    personality: string;
  } | null;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('mimo_token', res.token);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('mimo_token', res.token);
    return res;
  },

  async me(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('mimo_token');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('mimo_token');
  },
};
