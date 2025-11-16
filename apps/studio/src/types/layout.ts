export type PanelId =
  | 'nodePanel'
  | 'nodeEditor'
  | 'viewport3d'
  | 'inspector'
  | 'console'
  | 'toolbar';

export type LayoutPresetId = 'guided' | 'professional' | 'modeling' | 'nodeFocused' | 'custom';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

export type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';

export type LayoutDirection = 'row' | 'column';

export interface PanelSize {
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface PanelConfig {
  id: PanelId;
  title: string;
  visible: boolean;
  minimized: boolean;
  size: PanelSize;
  position: PanelPosition;
  zIndex?: number;
  resizable: boolean;
  closable: boolean;
  order: number;
}

export interface LayoutNode {
  type: 'panel' | 'container';
  id: string;
  size: number; // flex basis or percentage
  children?: LayoutNode[];
  direction?: LayoutDirection;
  minSize?: number;
  maxSize?: number;
}

export interface WorkbenchLayout {
  id: string;
  name: string;
  description?: string;
  panels: Record<PanelId, PanelConfig>;
  layout: LayoutNode;
  metadata: {
    created: Date;
    modified: Date;
    isDefault: boolean;
    screenSize: ScreenSize;
    version: string;
  };
}

export interface FocusMode {
  focusedPanel: PanelId | null;
  previousLayout: WorkbenchLayout | null;
  dimOtherPanels: boolean;
  hideToolbars: boolean;
  transitionDuration: number;
}

export interface LayoutStore {
  // State
  currentLayout: WorkbenchLayout;
  focusMode: FocusMode;
  savedLayouts: WorkbenchLayout[];
  screenSize: ScreenSize;
  isInitialized: boolean;

  // Actions
  setLayout: (layout: WorkbenchLayout) => void;
  updatePanelConfig: (panelId: PanelId, config: Partial<PanelConfig>) => void;
  resizePanel: (panelId: PanelId, size: PanelSize) => void;
  togglePanelVisibility: (panelId: PanelId) => void;
  minimizePanel: (panelId: PanelId) => void;
  maximizePanel: (panelId: PanelId) => void;

  // Focus mode
  enterFocusMode: (panelId: PanelId) => void;
  exitFocusMode: () => void;

  // Presets
  loadPreset: (presetId: LayoutPresetId) => void;
  saveAsPreset: (name: string, description?: string) => void;
  deletePreset: (layoutId: string) => void;

  // Utilities
  resetToDefault: () => void;
  getScreenSize: () => ScreenSize;
  updateScreenSize: (size: ScreenSize) => void;
  exportLayout: () => string;
  importLayout: (layoutJson: string) => void;
}

export interface LayoutBreakpoints {
  mobile: {
    maxWidth: number;
    defaultLayout: LayoutPresetId;
    hiddenPanels: PanelId[];
    adaptations: Partial<Record<PanelId, Partial<PanelConfig>>>;
  };
  tablet: {
    maxWidth: number;
    defaultLayout: LayoutPresetId;
    hiddenPanels: PanelId[];
    adaptations: Partial<Record<PanelId, Partial<PanelConfig>>>;
  };
  desktop: {
    maxWidth: number;
    defaultLayout: LayoutPresetId;
    hiddenPanels: PanelId[];
    adaptations: Partial<Record<PanelId, Partial<PanelConfig>>>;
  };
  ultrawide: {
    maxWidth: number;
    defaultLayout: LayoutPresetId;
    hiddenPanels: PanelId[];
    adaptations: Partial<Record<PanelId, Partial<PanelConfig>>>;
  };
}
