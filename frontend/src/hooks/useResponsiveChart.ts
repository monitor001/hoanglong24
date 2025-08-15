import { useState, useEffect, useRef } from 'react';
import { DEVICE_LOGIC } from '../config/breakpoints';

interface Dimensions {
  width: number;
  height: number;
}

export const useResponsiveChart = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: width < 576 ? width * 0.8 : width < 768 ? 280 : 300 // Dynamic height for different screen sizes
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return { dimensions, containerRef };
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const useResponsiveBreakpoint = () => {
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