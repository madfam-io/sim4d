import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  'mobile-s': 320,
  'mobile-m': 375,
  'mobile-l': 425,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  'desktop-l': 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Device capabilities detection
export interface DeviceCapabilities {
  touch: boolean;
  hover: boolean;
  pointer: 'coarse' | 'fine' | 'none';
  orientation: 'portrait' | 'landscape';
  reducedMotion: boolean;
  highContrast: boolean;
}

// Get current breakpoint
export const getBreakpoint = (): Breakpoint => {
  const width = window.innerWidth;

  if (width < breakpoints['mobile-m']) return 'mobile-s';
  if (width < breakpoints['mobile-l']) return 'mobile-m';
  if (width < breakpoints.tablet) return 'mobile-l';
  if (width < breakpoints.laptop) return 'tablet';
  if (width < breakpoints.desktop) return 'laptop';
  if (width < breakpoints['desktop-l']) return 'desktop';
  return 'desktop-l';
};

// Get device type from breakpoint
export const getDeviceType = (breakpoint: Breakpoint): DeviceType => {
  if (breakpoint.startsWith('mobile')) return 'mobile';
  if (breakpoint === 'tablet') return 'tablet';
  return 'desktop';
};

// Detect device capabilities
export const getDeviceCapabilities = (): DeviceCapabilities => {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const pointerCoarse = window.matchMedia('(pointer: coarse)').matches;
  const pointerFine = window.matchMedia('(pointer: fine)').matches;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

  return {
    touch: hasTouch,
    hover: hasHover,
    pointer: pointerCoarse ? 'coarse' : pointerFine ? 'fine' : 'none',
    orientation: isPortrait ? 'portrait' : 'landscape',
    reducedMotion,
    highContrast,
  };
};

// Main responsive hook
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint());
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(getDeviceCapabilities());
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setBreakpoint(getBreakpoint());
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // Debounce resize events
    };

    const handleOrientationChange = () => {
      setCapabilities(getDeviceCapabilities());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for media query changes
    const mediaQueries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];

    const handleMediaChange = () => {
      setCapabilities(getDeviceCapabilities());
    };

    mediaQueries.forEach((mq) => {
      mq.addEventListener('change', handleMediaChange);
    });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQueries.forEach((mq) => {
        mq.removeEventListener('change', handleMediaChange);
      });
    };
  }, []);

  const deviceType = getDeviceType(breakpoint);
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isTouchDevice = capabilities.touch;

  // Helper functions
  const isBreakpoint = (bp: Breakpoint) => breakpoint === bp;
  const isAbove = (bp: Breakpoint) => window.innerWidth >= breakpoints[bp];
  const isBelow = (bp: Breakpoint) => window.innerWidth < breakpoints[bp];

  return {
    // Current state
    breakpoint,
    deviceType,
    capabilities,
    dimensions,

    // Boolean helpers
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,

    // Utilities
    isBreakpoint,
    isAbove,
    isBelow,
  };
};

// CSS-in-JS helper for responsive styles
export const responsive = (styles: Partial<Record<Breakpoint, React.CSSProperties>>) => {
  const currentBreakpoint = getBreakpoint();
  const breakpointOrder: Breakpoint[] = [
    'mobile-s',
    'mobile-m',
    'mobile-l',
    'tablet',
    'laptop',
    'desktop',
    'desktop-l',
  ];

  let appliedStyles: React.CSSProperties = {};

  for (const bp of breakpointOrder) {
    if (styles[bp]) {
      appliedStyles = { ...appliedStyles, ...styles[bp] };
    }
    if (bp === currentBreakpoint) break;
  }

  return appliedStyles;
};

// Media query hook for custom breakpoints
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};
