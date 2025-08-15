/**
 * Unified Responsive Breakpoints Configuration
 * 
 * Cấu hình breakpoint thống nhất cho toàn bộ dự án
 * Có xem xét orientation (xoay màn hình) để đảm bảo trải nghiệm tốt
 */

export const BREAKPOINTS = {
  // Pixel breakpoints
  MOBILE_MAX: 768,
  TABLET_MIN: 769,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025,
  LARGE_DESKTOP_MIN: 1440,
  
  // Orientation-aware breakpoints
  MOBILE_PORTRAIT_MAX: 768,
  MOBILE_LANDSCAPE_MAX: 1024, // Mobile xoay ngang = tablet portrait
  TABLET_PORTRAIT_MAX: 1024,
  TABLET_LANDSCAPE_MAX: 1366, // Tablet xoay ngang ~ small desktop
} as const;

/**
 * CSS Media Query Strings
 */
export const MEDIA_QUERIES = {
  // Basic device types
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`,
  TABLET: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP_MIN}px)`,
  LARGE_DESKTOP: `(min-width: ${BREAKPOINTS.LARGE_DESKTOP_MIN}px)`,
  
  // Orientation-aware queries
  MOBILE_PORTRAIT: `(max-width: ${BREAKPOINTS.MOBILE_PORTRAIT_MAX}px) and (orientation: portrait)`,
  MOBILE_LANDSCAPE: `(max-width: ${BREAKPOINTS.MOBILE_LANDSCAPE_MAX}px) and (orientation: landscape) and (max-height: 500px)`,
  
  TABLET_PORTRAIT: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_PORTRAIT_MAX}px) and (orientation: portrait)`,
  TABLET_LANDSCAPE: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE_MAX}px) and (orientation: landscape)`,
  
  // Combined queries for better UX
  SMALL_SCREEN: `(max-width: ${BREAKPOINTS.TABLET_MAX}px)`, // Mobile + Tablet
  TOUCH_DEVICE: `(max-width: ${BREAKPOINTS.TABLET_MAX}px)`, // Devices with touch
  
  // Special cases
  MOBILE_ANY_ORIENTATION: `(max-width: ${BREAKPOINTS.MOBILE_MAX}px), (max-width: ${BREAKPOINTS.MOBILE_LANDSCAPE_MAX}px) and (orientation: landscape) and (max-height: 500px)`,
  TABLET_ANY_ORIENTATION: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_LANDSCAPE_MAX}px)`,
} as const;

/**
 * Device Detection Logic
 */
export const DEVICE_LOGIC = {
  // Mobile: ≤768px portrait HOẶC ≤1024px landscape với height ≤500px
  IS_MOBILE: `${MEDIA_QUERIES.MOBILE_PORTRAIT}, ${MEDIA_QUERIES.MOBILE_LANDSCAPE}`,
  
  // Tablet: 769-1024px portrait HOẶC 769-1366px landscape
  IS_TABLET: `${MEDIA_QUERIES.TABLET_PORTRAIT}, ${MEDIA_QUERIES.TABLET_LANDSCAPE}`,
  
  // Desktop: >1024px portrait HOẶC >1366px landscape
  IS_DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP_MIN}px) and (orientation: portrait), (min-width: ${BREAKPOINTS.TABLET_LANDSCAPE_MAX + 1}px) and (orientation: landscape)`,
} as const;

/**
 * Component-specific breakpoints
 */
export const COMPONENT_BREAKPOINTS = {
  TABLE: {
    MOBILE_PAGE_SIZE: 5,
    TABLET_PAGE_SIZE: 8,
    DESKTOP_PAGE_SIZE: 10,
    MOBILE_SCROLL_X: 600,
    TABLET_SCROLL_X: 800,
    DESKTOP_SCROLL_X: 1000,
  },
  
  GRID: {
    MOBILE_COLUMNS: 1,
    TABLET_COLUMNS: 2,
    DESKTOP_COLUMNS: 3,
    LARGE_DESKTOP_COLUMNS: 4,
  },
  
  CHART: {
    MOBILE_HEIGHT: 250,
    TABLET_HEIGHT: 280,
    DESKTOP_HEIGHT: 300,
    LARGE_DESKTOP_HEIGHT: 350,
  },
  
  TOUCH_TARGET: {
    MIN_SIZE: 44, // Minimum touch target size in pixels
  },
} as const;

/**
 * CSS Custom Properties for use in CSS files
 */
export const CSS_VARIABLES = `
  :root {
    --breakpoint-mobile-max: ${BREAKPOINTS.MOBILE_MAX}px;
    --breakpoint-tablet-min: ${BREAKPOINTS.TABLET_MIN}px;
    --breakpoint-tablet-max: ${BREAKPOINTS.TABLET_MAX}px;
    --breakpoint-desktop-min: ${BREAKPOINTS.DESKTOP_MIN}px;
    --breakpoint-large-desktop-min: ${BREAKPOINTS.LARGE_DESKTOP_MIN}px;
    
    --mobile-landscape-max: ${BREAKPOINTS.MOBILE_LANDSCAPE_MAX}px;
    --tablet-landscape-max: ${BREAKPOINTS.TABLET_LANDSCAPE_MAX}px;
    
    --touch-target-min-size: ${COMPONENT_BREAKPOINTS.TOUCH_TARGET.MIN_SIZE}px;
  }
`;

/**
 * Helper function to generate media queries
 */
export const createMediaQuery = (query: string): string => `@media ${query}`;

/**
 * Export for use in styled-components or emotion
 */
export const mediaQueries = {
  mobile: createMediaQuery(DEVICE_LOGIC.IS_MOBILE),
  tablet: createMediaQuery(DEVICE_LOGIC.IS_TABLET),
  desktop: createMediaQuery(DEVICE_LOGIC.IS_DESKTOP),
  
  mobilePortrait: createMediaQuery(MEDIA_QUERIES.MOBILE_PORTRAIT),
  mobileLandscape: createMediaQuery(MEDIA_QUERIES.MOBILE_LANDSCAPE),
  tabletPortrait: createMediaQuery(MEDIA_QUERIES.TABLET_PORTRAIT),
  tabletLandscape: createMediaQuery(MEDIA_QUERIES.TABLET_LANDSCAPE),
  
  smallScreen: createMediaQuery(MEDIA_QUERIES.SMALL_SCREEN),
  touchDevice: createMediaQuery(MEDIA_QUERIES.TOUCH_DEVICE),
};
