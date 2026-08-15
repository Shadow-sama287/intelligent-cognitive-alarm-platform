import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  authReady: false,

  // Re-fetch the logged-in user from the server.
  // Called on app startup so `user` is populated even after a page refresh.
  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, authReady: true });
      return;
    }

    try {
      const userRes = await apiClient.get('/auth/me');
      set({ user: userRes.data?.data || userRes.data, isAuthenticated: true, authReady: true });
    } catch {
      // Token is invalid/expired — clear the session
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, authReady: true });
    }
  },

  login: async (email, password) => {
    // Backend /auth/login accepts JSON LoginRequest
    const res = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const userData = res.data.user || res.data?.data?.user;
    set({ token, user: userData, isAuthenticated: true });

    // Ensure profile is synced
    try {
      const userRes = await apiClient.get('/auth/me');
      set({ user: userRes.data?.data || userRes.data });
    } catch {
      // Keep existing user data if /auth/me fails
    }
  },

  register: async (username, email, password) => {
    // Map username to full_name and send confirm_password as required by RegisterRequest schema
    await apiClient.post('/auth/register', {
      email,
      password,
      confirm_password: password,
      full_name: username,
      role: 'user'
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
