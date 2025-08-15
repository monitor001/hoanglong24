import { useState, useEffect } from 'react';
import { DEVICE_LOGIC, MEDIA_QUERIES } from '../config/breakpoints';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};

export const useResponsive = () => {
  const isMobile = useMediaQuery(DEVICE_LOGIC.IS_MOBILE);
  const isTablet = useMediaQuery(DEVICE_LOGIC.IS_TABLET);
  const isDesktop = useMediaQuery(DEVICE_LOGIC.IS_DESKTOP);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: isMobile || isTablet
  };
};

/**
 * Hook for orientation-aware responsive behavior
 */
export const useResponsiveWithOrientation = () => {
  const isMobilePortrait = useMediaQuery(MEDIA_QUERIES.MOBILE_PORTRAIT);
  const isMobileLandscape = useMediaQuery(MEDIA_QUERIES.MOBILE_LANDSCAPE);
  const isTabletPortrait = useMediaQuery(MEDIA_QUERIES.TABLET_PORTRAIT);
  const isTabletLandscape = useMediaQuery(MEDIA_QUERIES.TABLET_LANDSCAPE);
  
  const isMobile = isMobilePortrait || isMobileLandscape;
  const isTablet = isTabletPortrait || isTabletLandscape;
  const isDesktop = useMediaQuery(DEVICE_LOGIC.IS_DESKTOP);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobilePortrait,
    isMobileLandscape,
    isTabletPortrait,
    isTabletLandscape,
    isSmallScreen: isMobile || isTablet,
    isTouchDevice: useMediaQuery(MEDIA_QUERIES.TOUCH_DEVICE)
  };
}; 