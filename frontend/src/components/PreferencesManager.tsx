import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { 
  setPreferencesLoaded, 
  setPreferencesError, 
  updateFromPreferences 
} from '../store/slices/uiSlice';

interface PreferencesManagerProps {
  children: React.ReactNode;
}

const PreferencesManager: React.FC<PreferencesManagerProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { 
    preferences, 
    loading, 
    error, 
    getPreference,
    setPreference 
  } = useUserPreferences();

  // Update Redux store when preferences change
  useEffect(() => {
    if (!loading) {
      dispatch(setPreferencesLoaded(true));
      
      // Update UI state from preferences
      const theme = getPreference('theme', 'system') as 'light' | 'dark' | 'system';
      const language = getPreference('language', 'en') as 'en' | 'vi';
      const sidebarCollapsed = getPreference('sidebarCollapsed', false) as boolean;
      const isDarkMode = getPreference('isDarkMode', false) as boolean;

      dispatch(updateFromPreferences({
        theme,
        language,
        sidebarCollapsed,
        isDarkMode
      }));
    }
  }, [loading, preferences, dispatch, getPreference]);

  // Update error state
  useEffect(() => {
    dispatch(setPreferencesError(error));
  }, [error, dispatch]);

  // Sync theme changes back to preferences
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreference('theme', theme);
  };

  // Sync language changes back to preferences
  const handleLanguageChange = (language: 'en' | 'vi') => {
    setPreference('language', language);
  };

  // Sync sidebar changes back to preferences
  const handleSidebarChange = (collapsed: boolean) => {
    setPreference('sidebarCollapsed', collapsed);
  };

  // Expose handlers to children via context if needed
  const contextValue = {
    handleThemeChange,
    handleLanguageChange,
    handleSidebarChange,
    getPreference,
    setPreference
  };

  return (
    <div className="preferences-manager">
      {children}
    </div>
  );
};

export default PreferencesManager;
