import React from 'react';

export interface Panel {
  id: string;
  title: string;
  label?: string;
  content: React.ReactNode;
  icon?: string;
  badge?: number;
}

export interface ResponsiveLayoutProps {
  panels: {
    nodeEditor: Panel;
    viewport: Panel;
    palette: Panel;
    inspector: Panel;
    console?: Panel;
    toolbar?: Panel;
  };
  defaultPanel?: string;
  onPanelChange?: (panelId: string) => void;
  enableGestures?: boolean;
  enableKeyboardShortcuts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  useAdaptiveEngine?: boolean;
}
