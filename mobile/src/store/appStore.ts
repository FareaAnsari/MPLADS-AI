import { create } from 'zustand';

export type SupportedLanguage = 'en' | 'hi';
export type AppThemeMode = 'light' | 'dark' | 'system';

interface AppUiState {
  language: SupportedLanguage;
  themeMode: AppThemeMode;
  isOffline: boolean;
  activeRolePreview: string | null;
  setLanguage: (lang: SupportedLanguage) => void;
  setThemeMode: (mode: AppThemeMode) => void;
  setOfflineStatus: (offline: boolean) => void;
  setActiveRolePreview: (role: string | null) => void;
}

export const useAppStore = create<AppUiState>((set) => ({
  language: 'en',
  themeMode: 'system',
  isOffline: false,
  activeRolePreview: null,
  setLanguage: (language) => set({ language }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setOfflineStatus: (isOffline) => set({ isOffline }),
  setActiveRolePreview: (activeRolePreview) => set({ activeRolePreview }),
}));
