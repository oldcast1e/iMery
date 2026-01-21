import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            language: 'ko', // 'ko' or 'en'
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useUserStore;
