import { apiRequest } from './api';
import { User, UserSettings } from '../types/pet';

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

  async getSettings(): Promise<UserSettings> {
    const res = await apiRequest<{ settings: UserSettings }>('/user/settings');
    return res.settings;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<{ message: string; settings: UserSettings }> {
    return apiRequest<{ message: string; settings: UserSettings }>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async updateProfile(name: string, email: string): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  },

  async updatePassword(current_password: string, new_password: string, new_password_confirmation: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
    });
  },

  async deleteAccount(password: string): Promise<{ message: string }> {
    const res = await apiRequest<{ message: string }>('/user/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    localStorage.removeItem('mimo_token');
    return res;
  },

  getToken(): string | null {
    return localStorage.getItem('mimo_token');
  },
};
