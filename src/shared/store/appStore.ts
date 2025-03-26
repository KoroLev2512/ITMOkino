import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  profilePageIsClose: boolean;
  toggleDarkMode: (value: boolean) => void;
  toggleProfilePage: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: false,
  profilePageIsClose: true,
  toggleDarkMode: (value: boolean) => set({ isDarkMode: value }),
  toggleProfilePage: (value: boolean) => set({ profilePageIsClose: value }),
})); 