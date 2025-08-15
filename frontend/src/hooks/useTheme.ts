import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '../store';

export const useTheme = () => {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    // Check initial system preference
    const checkSystemPreference = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSystemPrefersDark(prefersDark);
    };

    checkSystemPreference();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Determine the actual theme being used
  const getActualTheme = () => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemPrefersDark ? 'dark' : 'light';
  };

  const getActualIsDarkMode = () => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemPrefersDark;
  };

  return {
    theme,
    isDarkMode,
    systemPrefersDark,
    actualTheme: getActualTheme(),
    actualIsDarkMode: getActualIsDarkMode(),
  };
};
