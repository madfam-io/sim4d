// Enhanced UI Component Library Exports
// Professional CAD-grade components for BrepFlow Studio

// Core Components
export { Button, IconButton } from './Button';
export { Input, CoordinateInput as Vec3Input } from './Input';
export { NumberInput, CoordinateInput } from './NumberInput';
export { Panel } from './Panel';

export { PanelSection } from './PanelSection';
export type { PanelSectionProps } from './PanelSection';

// Enhanced Viewport
export { Enhanced3DViewport } from '../viewport/Enhanced3DViewport';
export type { ViewportProps, ViewportToolConfig } from '../viewport/Enhanced3DViewport';

// Re-export existing components for consistency
export { Icon } from '../icons/IconSystem';

// Design System Utilities
export const DESIGN_TOKENS = {
  colors: {
    engineering: {
      50: 'var(--color-engineering-50)',
      100: 'var(--color-engineering-100)',
      200: 'var(--color-engineering-200)',
      300: 'var(--color-engineering-300)',
      400: 'var(--color-engineering-400)',
      500: 'var(--color-engineering-500)',
      600: 'var(--color-engineering-600)',
      700: 'var(--color-engineering-700)',
      800: 'var(--color-engineering-800)',
      900: 'var(--color-engineering-900)',
    },
    technical: {
      50: 'var(--color-technical-50)',
      100: 'var(--color-technical-100)',
      200: 'var(--color-technical-200)',
      300: 'var(--color-technical-300)',
      400: 'var(--color-technical-400)',
      500: 'var(--color-technical-500)',
      600: 'var(--color-technical-600)',
      700: 'var(--color-technical-700)',
      800: 'var(--color-technical-800)',
      900: 'var(--color-technical-900)',
    },
    precision: {
      50: 'var(--color-precision-50)',
      100: 'var(--color-precision-100)',
      200: 'var(--color-precision-200)',
      300: 'var(--color-precision-300)',
      400: 'var(--color-precision-400)',
      500: 'var(--color-precision-500)',
      600: 'var(--color-precision-600)',
      700: 'var(--color-precision-700)',
      800: 'var(--color-precision-800)',
      900: 'var(--color-precision-900)',
    },
    status: {
      geometryValid: 'var(--color-geometry-valid)',
      geometryInvalid: 'var(--color-geometry-invalid)',
      geometryPending: 'var(--color-geometry-pending)',
      geometryPreview: 'var(--color-geometry-preview)',
      nodeSelected: 'var(--color-node-selected)',
      nodeExecuting: 'var(--color-node-executing)',
      nodeError: 'var(--color-node-error)',
      nodeSuccess: 'var(--color-node-success)',
    },
    connections: {
      shape: 'var(--color-connection-shape)',
      number: 'var(--color-connection-number)',
      vector: 'var(--color-connection-vector)',
      boolean: 'var(--color-connection-boolean)',
    },
  },
  spacing: {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
  },
  fontSize: {
    displayXl: 'var(--font-size-display-xl)',
    displayLg: 'var(--font-size-display-lg)',
    displayMd: 'var(--font-size-display-md)',
    h1: 'var(--font-size-xl)',
    h2: 'var(--font-size-lg)',
    h3: 'var(--font-size-md)',
    h4: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    sm: 'var(--font-size-sm)',
    xs: 'var(--font-size-xs)',
    xxs: 'var(--font-size-xxs)',
    technical: 'var(--font-size-technical)',
    code: 'var(--font-size-code)',
  },
  borderRadius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
  shadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    inner: 'var(--shadow-inner)',
    focus: 'var(--shadow-focus)',
    panel: 'var(--shadow-panel)',
    toolbar: 'var(--shadow-toolbar)',
    dropdown: 'var(--shadow-dropdown)',
    modal: 'var(--shadow-modal)',
    button: 'var(--shadow-button)',
    buttonHover: 'var(--shadow-button-hover)',
    buttonActive: 'var(--shadow-button-active)',
    node: 'var(--shadow-node)',
    nodeSelected: 'var(--shadow-node-selected)',
    nodeError: 'var(--shadow-node-error)',
    viewport: 'var(--shadow-viewport)',
    viewportTool: 'var(--shadow-viewport-tool)',
  },
  transition: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    smooth: 'var(--duration-smooth)',
    slow: 'var(--duration-slow)',
    button: 'var(--transition-button)',
    panel: 'var(--transition-panel)',
    hover: 'var(--transition-hover)',
    focus: 'var(--transition-focus)',
    transform: 'var(--transition-transform)',
    input: 'var(--transition-input)',
    node: 'var(--transition-node)',
  },
} as const;

// Component Size Presets
export const COMPONENT_SIZES = {
  button: {
    sm: { height: 'var(--button-height-sm)', padding: 'var(--spacing-1) var(--spacing-3)' },
    md: { height: 'var(--button-height-md)', padding: 'var(--spacing-2) var(--spacing-4)' },
    lg: { height: 'var(--button-height-lg)', padding: 'var(--spacing-3) var(--spacing-6)' },
  },
  input: {
    sm: { height: 'var(--input-height-sm)', padding: 'var(--spacing-1) var(--spacing-3)' },
    md: { height: 'var(--input-height-md)', padding: 'var(--spacing-2) var(--spacing-3)' },
    lg: { height: 'var(--input-height-lg)', padding: 'var(--spacing-3) var(--spacing-4)' },
  },
  panel: {
    header: { height: 'var(--panel-header-height)', padding: 'var(--spacing-4)' },
    content: { padding: 'var(--spacing-4)' },
  },
  node: {
    minWidth: 'var(--node-min-width)',
    minHeight: 'var(--node-min-height)',
    padding: 'var(--node-padding)',
    borderRadius: 'var(--node-border-radius)',
  },
  toolbar: {
    height: 'var(--toolbar-height)',
    padding: 'var(--toolbar-padding)',
    gap: 'var(--toolbar-gap)',
  },
} as const;

// Professional Animation Presets
export const ANIMATIONS = {
  easing: {
    precise: 'var(--ease-precise)',
    smooth: 'var(--ease-smooth)',
    snap: 'var(--ease-snap)',
    technical: 'var(--ease-technical)',
    elastic: 'var(--ease-elastic)',
    back: 'var(--ease-back)',
  },
  duration: {
    instant: 'var(--duration-instant)',
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    smooth: 'var(--duration-smooth)',
    slow: 'var(--duration-slow)',
  },
} as const;

// CSS Custom Property Helpers
export const getCSSVar = (token: string): string => `var(--${token})`;

export const createCSSVars = (tokens: Record<string, string>): Record<string, string> => {
  return Object.entries(tokens).reduce(
    (acc, [key, value]) => {
      acc[`--${key}`] = value;
      return acc;
    },
    {} as Record<string, string>
  );
};

// Theme Utilities
export const applyTheme = (element: HTMLElement, theme: 'light' | 'dark' | 'auto' = 'auto') => {
  if (theme === 'auto') {
    element.classList.remove('theme-light', 'theme-dark');
  } else {
    element.classList.remove('theme-light', 'theme-dark');
    element.classList.add(`theme-${theme}`);
  }
};

// Responsive Breakpoint Helpers
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const mediaQuery = (breakpoint: keyof typeof BREAKPOINTS) =>
  `@media (min-width: ${BREAKPOINTS[breakpoint]})`;

// Accessibility Helpers
export const ARIA_LABELS = {
  close: 'Close',
  expand: 'Expand',
  collapse: 'Collapse',
  menu: 'Menu',
  search: 'Search',
  settings: 'Settings',
  help: 'Help',
  more: 'More options',
  previous: 'Previous',
  next: 'Next',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
} as const;

// Professional Color Combinations
export const COLOR_COMBINATIONS = {
  primary: {
    bg: 'var(--color-engineering-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-engineering-600)',
    hover: 'var(--color-engineering-600)',
  },
  secondary: {
    bg: 'var(--color-surface-primary)',
    text: 'var(--color-text-primary)',
    border: 'var(--color-border)',
    hover: 'var(--color-surface-secondary)',
  },
  success: {
    bg: 'var(--color-success-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-success-600)',
    hover: 'var(--color-success-600)',
  },
  warning: {
    bg: 'var(--color-warning-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-warning-600)',
    hover: 'var(--color-warning-600)',
  },
  error: {
    bg: 'var(--color-error-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-error-600)',
    hover: 'var(--color-error-600)',
  },
  technical: {
    bg: 'var(--color-technical-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-technical-600)',
    hover: 'var(--color-technical-600)',
  },
  precision: {
    bg: 'var(--color-precision-500)',
    text: 'var(--color-text-inverse)',
    border: 'var(--color-precision-600)',
    hover: 'var(--color-precision-600)',
  },
} as const;
