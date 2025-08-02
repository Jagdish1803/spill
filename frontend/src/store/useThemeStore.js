import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,
      
      toggleTheme: () => {
        const { isDarkMode } = get();
        const newTheme = !isDarkMode;
        set({ isDarkMode: newTheme });
        
        // Update document class
        if (newTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
      
      initializeTheme: () => {
        const { isDarkMode } = get();
        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeTheme();
        }
      },
    }
  )
);