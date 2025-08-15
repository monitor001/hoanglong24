import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../axiosConfig';

export interface UserPreference {
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export interface UserPreferences {
  [key: string]: {
    value: string;
    category: string;
    updatedAt: string;
  };
}

export interface DefaultPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'vi';
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  dashboardLayout: string;
  projectView: string;
  taskView: string;
  documentView: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const user = useSelector((state: any) => state.auth.user);

  // Default preferences
  const defaultPreferences: DefaultPreferences = {
    theme: 'system',
    language: 'en',
    sidebarCollapsed: false,
    isDarkMode: false,
    dashboardLayout: 'default',
    projectView: 'card',
    taskView: 'list',
    documentView: 'grid'
  };

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/user-preferences');
      const dbPreferences = response.data;
      
      setPreferences(dbPreferences);
      
      // Sync with localStorage
      await syncWithLocalStorage(dbPreferences);
      
    } catch (err: any) {
      console.error('Error loading user preferences:', err);
      setError(err.response?.data?.error || 'Failed to load preferences');
      
      // Fallback to localStorage
      await loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load preferences from localStorage
  const loadFromLocalStorage = useCallback(async () => {
    try {
      const localStorageData: any = {};
      
      // Load common preferences from localStorage
      const theme = localStorage.getItem('theme');
      const language = localStorage.getItem('language');
      const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
      
      if (theme) localStorageData.theme = theme;
      if (language) localStorageData.language = language;
      if (sidebarCollapsed) localStorageData.sidebarCollapsed = sidebarCollapsed;
      
      // Convert to preferences format
      const localPreferences: UserPreferences = {};
      Object.entries(localStorageData).forEach(([key, value]) => {
        localPreferences[key] = {
          value: String(value),
          category: 'ui',
          updatedAt: new Date().toISOString()
        };
      });
      
      setPreferences(localPreferences);
      
      // Sync to database if user is logged in
      if (user?.id) {
        await syncToDatabase(localStorageData);
      }
      
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, [user?.id]);

  // Sync preferences with localStorage
  const syncWithLocalStorage = useCallback(async (dbPreferences: UserPreferences) => {
    try {
      const localStorageData: any = {};
      
      // Get current localStorage values
      const theme = localStorage.getItem('theme');
      const language = localStorage.getItem('language');
      const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
      
      if (theme) localStorageData.theme = theme;
      if (language) localStorageData.language = language;
      if (sidebarCollapsed) localStorageData.sidebarCollapsed = sidebarCollapsed;
      
      // Update localStorage with database values
      Object.entries(dbPreferences).forEach(([key, pref]) => {
        localStorage.setItem(key, pref.value);
        localStorageData[key] = pref.value;
      });
      
      // Sync any localStorage-only values to database
      const dbKeys = Object.keys(dbPreferences);
      const localKeys = Object.keys(localStorageData);
      const newKeys = localKeys.filter(key => !dbKeys.includes(key));
      
      if (newKeys.length > 0 && user?.id) {
        const newPreferences = newKeys.map(key => ({
          key,
          value: localStorageData[key],
          category: 'ui'
        }));
        
        await updateMultiplePreferences(newPreferences);
      }
      
    } catch (err) {
      console.error('Error syncing with localStorage:', err);
    }
  }, [user?.id]);

  // Sync localStorage to database
  const syncToDatabase = useCallback(async (localStorageData: any) => {
    if (!user?.id) return;
    
    try {
      setSyncing(true);
      
      await axiosInstance.post('/user-preferences/sync', {
        localStorageData
      });
      
    } catch (err) {
      console.error('Error syncing to database:', err);
    } finally {
      setSyncing(false);
    }
  }, [user?.id]);

  // Update single preference
  const updatePreference = useCallback(async (key: string, value: any, category: string = 'ui') => {
    try {
      // Update local state immediately
      setPreferences(prev => ({
        ...prev,
        [key]: {
          value: String(value),
          category,
          updatedAt: new Date().toISOString()
        }
      }));
      
      // Update localStorage
      localStorage.setItem(key, String(value));
      
      // Update database if user is logged in
      if (user?.id) {
        await axiosInstance.put('/user-preferences', {
          key,
          value: String(value),
          category
        });
      }
      
    } catch (err: any) {
      console.error('Error updating preference:', err);
      setError(err.response?.data?.error || 'Failed to update preference');
    }
  }, [user?.id]);

  // Update multiple preferences
  const updateMultiplePreferences = useCallback(async (preferencesArray: Array<{key: string, value: any, category?: string}>) => {
    try {
      // Update local state immediately
      const newPreferences: UserPreferences = {};
      preferencesArray.forEach(({ key, value, category = 'ui' }) => {
        newPreferences[key] = {
          value: String(value),
          category,
          updatedAt: new Date().toISOString()
        };
        
        // Update localStorage
        localStorage.setItem(key, String(value));
      });
      
      setPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
      
      // Update database if user is logged in
      if (user?.id) {
        await axiosInstance.put('/user-preferences/multiple', {
          preferences: preferencesArray
        });
      }
      
    } catch (err: any) {
      console.error('Error updating multiple preferences:', err);
      setError(err.response?.data?.error || 'Failed to update preferences');
    }
  }, [user?.id]);

  // Get preference value
  const getPreference = useCallback((key: string, defaultValue?: any) => {
    const preference = preferences[key];
    if (preference) {
      try {
        // Try to parse as JSON first
        return JSON.parse(preference.value);
      } catch {
        // If not JSON, return as string
        return preference.value;
      }
    }
    return defaultValue !== undefined ? defaultValue : defaultPreferences[key as keyof DefaultPreferences];
  }, [preferences]);

  // Set preference value
  const setPreference = useCallback((key: string, value: any, category: string = 'ui') => {
    updatePreference(key, value, category);
  }, [updatePreference]);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    try {
      // Reset to default preferences
      const defaultPrefsArray = Object.entries(defaultPreferences).map(([key, value]) => ({
        key,
        value,
        category: 'ui'
      }));
      
      await updateMultiplePreferences(defaultPrefsArray);
      
    } catch (err) {
      console.error('Error resetting preferences:', err);
    }
  }, [updateMultiplePreferences]);

  // Load preferences on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    } else {
      loadFromLocalStorage();
    }
  }, [user?.id, loadPreferences, loadFromLocalStorage]);

  return {
    preferences,
    loading,
    error,
    syncing,
    getPreference,
    setPreference,
    updatePreference,
    updateMultiplePreferences,
    resetPreferences,
    loadPreferences,
    defaultPreferences
  };
};
