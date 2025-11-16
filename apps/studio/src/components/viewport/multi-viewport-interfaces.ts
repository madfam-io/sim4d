/**
 * Multi-Viewport System Interfaces
 *
 * Defines the core interfaces for the multi-viewport system that manages
 * multiple 3D viewport instances with independent cameras and shared geometry.
 */

export type ViewportLayoutType = 'single' | 'quad' | 'horizontal' | 'vertical' | 'custom';

export type ViewportViewType =
  | 'perspective'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'iso';

export type ViewportRenderMode = 'wireframe' | 'shaded' | 'textured' | 'xray' | 'realistic';

export interface ViewportCameraState {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov: number;
  zoom: number;
  isOrthographic?: boolean;
}

export interface ViewportInstance {
  id: string;
  name: string;
  viewType: ViewportViewType;
  renderMode: ViewportRenderMode;
  camera: ViewportCameraState;
  active: boolean;
  visible: boolean;
  locked: boolean;
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
  quality: 'low' | 'medium' | 'high';
}

export interface ViewportLayoutConfig {
  type: ViewportLayoutType;
  viewports: ViewportInstance[];
  activeViewportId: string;
  syncedCameras: boolean;
  customLayout?: {
    rows: number;
    cols: number;
    spans?: Array<{
      viewportId: string;
      row: number;
      col: number;
      rowSpan?: number;
      colSpan?: number;
    }>;
  };
}

export interface ViewportLayoutManagerProps {
  className?: string;
  onLayoutChange?: (layout: ViewportLayoutConfig) => void;
  onViewportSelect?: (viewportId: string) => void;
  onCameraChange?: (viewportId: string, camera: ViewportCameraState) => void;
  onRenderModeChange?: (viewportId: string, mode: ViewportRenderMode) => void;
  initialLayout?: ViewportLayoutType;
  initialViewports?: Partial<ViewportInstance>[];
  enableKeyboardShortcuts?: boolean;
  showLayoutControls?: boolean;
  geometryData?: any; // Shared geometry data
}

export interface ViewportInstanceProps {
  viewport: ViewportInstance;
  isActive: boolean;
  geometryData?: any;
  onCameraChange?: (camera: ViewportCameraState) => void;
  onSelect?: () => void;
  onRenderModeChange?: (mode: ViewportRenderMode) => void;
  onViewTypeChange?: (viewType: ViewportViewType) => void;
  className?: string;
}

export interface ViewportSynchronization {
  cameras: boolean;
  renderModes: boolean;
  lighting: boolean;
  zoom: boolean;
  pan: boolean;
  rotation: boolean;
}

// Enhanced sync modes for camera synchronization
export type CameraSyncMode = 'none' | 'rotation' | 'pan' | 'zoom' | 'full' | 'orthographic-lock';

export interface CameraSyncConfiguration {
  mode: CameraSyncMode;
  direction?: 'xy' | 'xz' | 'yz' | 'all';
  preserveOrthographic: boolean;
  interpolationSpeed: number;
  enabled: boolean;
}

export interface ViewportSyncParticipation {
  participateInSync: boolean;
  receivesUpdates: boolean;
  sendsUpdates: boolean;
  priority: number;
  syncConfig: CameraSyncConfiguration;
}

export interface ViewportPerformanceSettings {
  maxViewports: number;
  adaptiveQuality: boolean;
  levelOfDetail: boolean;
  frustumCulling: boolean;
  instancedRendering: boolean;
}

// Standard viewport configurations
export const STANDARD_VIEWPORT_CONFIGS: Record<ViewportViewType, Partial<ViewportCameraState>> = {
  perspective: {
    position: [10, 10, 10],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: false,
  },
  front: {
    position: [0, -10, 0],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: true,
  },
  back: {
    position: [0, 10, 0],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: true,
  },
  left: {
    position: [-10, 0, 0],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: true,
  },
  right: {
    position: [10, 0, 0],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: true,
  },
  top: {
    position: [0, 0, 10],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: 45,
    isOrthographic: true,
  },
  bottom: {
    position: [0, 0, -10],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: 45,
    isOrthographic: true,
  },
  iso: {
    position: [10, -10, 10],
    target: [0, 0, 0],
    up: [0, 0, 1],
    fov: 45,
    isOrthographic: false,
  },
};

// Default layout configurations
export const DEFAULT_LAYOUTS: Record<
  ViewportLayoutType,
  Omit<ViewportLayoutConfig, 'viewports'>
> = {
  single: {
    type: 'single',
    activeViewportId: 'main',
    syncedCameras: false,
  },
  quad: {
    type: 'quad',
    activeViewportId: 'perspective',
    syncedCameras: false,
  },
  horizontal: {
    type: 'horizontal',
    activeViewportId: 'main',
    syncedCameras: false,
  },
  vertical: {
    type: 'vertical',
    activeViewportId: 'main',
    syncedCameras: false,
  },
  custom: {
    type: 'custom',
    activeViewportId: 'main',
    syncedCameras: false,
    customLayout: {
      rows: 2,
      cols: 2,
    },
  },
};

// Default viewport instances for different layouts
export const createDefaultViewports = (layoutType: ViewportLayoutType): ViewportInstance[] => {
  const baseViewport = {
    active: false,
    visible: true,
    locked: false,
    showGrid: true,
    showAxes: true,
    backgroundColor: '#1a1a2e',
    quality: 'medium' as const,
    renderMode: 'shaded' as ViewportRenderMode,
  };

  switch (layoutType) {
    case 'single':
      return [
        {
          ...baseViewport,
          id: 'main',
          name: 'Main View',
          viewType: 'perspective',
          active: true,
          camera: { ...STANDARD_VIEWPORT_CONFIGS.perspective, zoom: 1 } as ViewportCameraState,
        },
      ];

    case 'quad':
      return [
        {
          ...baseViewport,
          id: 'perspective',
          name: 'Perspective',
          viewType: 'perspective',
          active: true,
          camera: { ...STANDARD_VIEWPORT_CONFIGS.perspective, zoom: 1 } as ViewportCameraState,
        },
        {
          ...baseViewport,
          id: 'front',
          name: 'Front',
          viewType: 'front',
          camera: { ...STANDARD_VIEWPORT_CONFIGS.front, zoom: 1 } as ViewportCameraState,
        },
        {
          ...baseViewport,
          id: 'top',
          name: 'Top',
          viewType: 'top',
          camera: { ...STANDARD_VIEWPORT_CONFIGS.top, zoom: 1 } as ViewportCameraState,
        },
        {
          ...baseViewport,
          id: 'right',
          name: 'Right',
          viewType: 'right',
          camera: { ...STANDARD_VIEWPORT_CONFIGS.right, zoom: 1 } as ViewportCameraState,
        },
      ];

    case 'horizontal':
      return [
        {
          ...baseViewport,
          id: 'left',
          name: 'Left View',
          viewType: 'perspective',
          active: true,
          camera: { ...STANDARD_VIEWPORT_CONFIGS.perspective, zoom: 1 } as ViewportCameraState,
        },
        {
          ...baseViewport,
          id: 'right',
          name: 'Right View',
          viewType: 'front',
          camera: { ...STANDARD_VIEWPORT_CONFIGS.front, zoom: 1 } as ViewportCameraState,
        },
      ];

    case 'vertical':
      return [
        {
          ...baseViewport,
          id: 'top',
          name: 'Top View',
          viewType: 'perspective',
          active: true,
          camera: { ...STANDARD_VIEWPORT_CONFIGS.perspective, zoom: 1 } as ViewportCameraState,
        },
        {
          ...baseViewport,
          id: 'bottom',
          name: 'Bottom View',
          viewType: 'top',
          camera: { ...STANDARD_VIEWPORT_CONFIGS.top, zoom: 1 } as ViewportCameraState,
        },
      ];

    default:
      return createDefaultViewports('single');
  }
};
