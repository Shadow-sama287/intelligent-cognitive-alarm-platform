import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Re-fetch the logged-in user from the server.
  // Called on app startup so `user` is populated even after a page refresh.
  init: async () => {
    const token = localStorage.getItem('token');
    if (!token || get().user) return; // already loaded or no session
    try {
      const userRes = await apiClient.get('/auth/me');
      set({ user: userRes.data.data });
    } catch {
      // Token is invalid/expired — clear the session
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);

    const res = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const token = res.data.access_token;
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });

    // Fetch user
    const userRes = await apiClient.get('/auth/me');
    set({ user: userRes.data.data });
  },

  register: async (username, email, password) => {
    // Map username to full_name as expected by the backend
    await apiClient.post('/auth/register', {
      email,
      password,
      full_name: username,
      role: 'user'
    });
    // The user can login directly after registration, or we can auto-login
    // Here we'll let the UI navigate to /login as originally designed.
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
