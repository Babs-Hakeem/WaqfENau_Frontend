import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  member: JSON.parse(localStorage.getItem('member')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, member } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('member', JSON.stringify(member));

      set({ member, accessToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const msg = error.response?.data?.message 
        || error.response?.data?.title 
        || error.response?.data?.errors?.[0] 
        || 'Login failed. Please check your credentials.';
      console.error('Login error:', error.response?.data);
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure dateOfBirth is ISO format (YYYY-MM-DD)
      const payload = {
        ...userData,
        dateOfBirth: userData.dateOfBirth || null,
      };
      
      console.log('Register payload:', payload);
      const response = await api.post('/auth/register', payload);
      const { accessToken, refreshToken, member } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('member', JSON.stringify(member));

      set({ member, accessToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const responseData = error.response?.data;
      console.error('Register error full response:', responseData);
      
      // Extract the most specific error message
      let msg = 'Registration failed';
      if (responseData?.errors) {
        // ASP.NET validation errors format
        const errorEntries = Object.entries(responseData.errors);
        msg = errorEntries.map(([field, errs]) => `${field}: ${errs.join(', ')}`).join('; ');
      } else if (responseData?.message) {
        msg = responseData.message;
      } else if (responseData?.title) {
        msg = responseData.title;
      } else if (typeof responseData === 'string') {
        msg = responseData;
      }
      
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('member');
    set({ member: null, accessToken: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));