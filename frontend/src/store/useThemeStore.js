import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(persist(
    (set, get) => ({
        isDark: false,
        toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
        setDark: (value) => set({ isDark: value }),
    }),
    {
        name: 'pos-theme',
    }
));

export default useThemeStore;
