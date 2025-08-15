import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'vi';
  loading: {
    [key: string]: boolean;
  };
  isDarkMode: boolean;
  preferencesLoaded: boolean;
  preferencesError: string | null;
}

const getInitialDarkMode = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  if (savedTheme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState: UiState = {
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system',
  language: (localStorage.getItem('language') as 'en' | 'vi') || 'en',
  loading: {},
  isDarkMode: getInitialDarkMode(),
  preferencesLoaded: false,
  preferencesError: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', String(action.payload));
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      // Update isDarkMode based on theme
      if (action.payload === 'dark') {
        state.isDarkMode = true;
      } else if (action.payload === 'light') {
        state.isDarkMode = false;
      } else {
        // For 'system', we'll need to check system preference
        state.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    },
    setLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    // New actions for preferences integration
    setPreferencesLoaded: (state, action: PayloadAction<boolean>) => {
      state.preferencesLoaded = action.payload;
    },
    setPreferencesError: (state, action: PayloadAction<string | null>) => {
      state.preferencesError = action.payload;
    },
    // Update UI state from preferences
    updateFromPreferences: (state, action: PayloadAction<{
      theme?: 'light' | 'dark' | 'system';
      language?: 'en' | 'vi';
      sidebarCollapsed?: boolean;
      isDarkMode?: boolean;
    }>) => {
      if (action.payload.theme !== undefined) {
        state.theme = action.payload.theme;
        localStorage.setItem('theme', action.payload.theme);
      }
      if (action.payload.language !== undefined) {
        state.language = action.payload.language;
        localStorage.setItem('language', action.payload.language);
      }
      if (action.payload.sidebarCollapsed !== undefined) {
        state.sidebarCollapsed = action.payload.sidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', String(action.payload.sidebarCollapsed));
      }
      if (action.payload.isDarkMode !== undefined) {
        state.isDarkMode = action.payload.isDarkMode;
      }
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarCollapsed, 
  setTheme, 
  setLanguage, 
  setLoading,
  setDarkMode,
  setPreferencesLoaded,
  setPreferencesError,
  updateFromPreferences
} = uiSlice.actions;

export default uiSlice.reducer; 