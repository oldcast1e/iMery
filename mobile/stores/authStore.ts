import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  user_id: number;
  nickname: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (userData) => {
    try {
      await AsyncStorage.setItem('imery-user', JSON.stringify(userData));
      set({ user: userData });
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('imery-user');
      set({ user: null });
    } catch (e) {
      console.error('Failed to remove user data', e);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const userJson = await AsyncStorage.getItem('imery-user');
      if (userJson) {
        set({ user: JSON.parse(userJson) });
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
