/**
 * Multi-Viewport Interface Definitions
 * Complete TypeScript interfaces for enterprise-grade multi-viewport system
 */

import * as THREE from 'three';
import type { PanelId, PanelConfig } from '../apps/studio/src/types/layout';

// =============================================================================
// Core Viewport Types
// =============================================================================

export type ViewportType =
  | 'perspective' // Free 3D navigation
  | 'front' // Front view (-Z axis)
  | 'back' // Back view (+Z axis)
  | 'top' // Top view (-Y axis)
  | 'bottom' // Bottom view (+Y axis)
  | 'right' // Right view (+X axis)
  | 'left' // Left view (-X axis)
  | 'custom'; // User-defined view

export type ViewportLayout =
  | 'single' // Single viewport (current behavior)
  | 'quad' // 2x2 grid: ISO, Front, Top, Right
  | 'horizontal' // 1x2: Main + side view
  | 'vertical' // 2x1: Main + top view
  | 'triple' // 3-viewport: Main + 2 ortho
  | 'custom'; // User-defined layout

export type SyncMode =
  | 'none' // No synchronization
  | 'rotation' // Sync camera rotation only
  | 'pan' // Sync camera target/pan only
  | 'zoom' // Sync camera zoom/distance only
  | 'full' // Full camera synchronization
  | 'selection'; // Sync selection highlighting only

export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// =============================================================================
// Camera & Viewport Configuration
// =============================================================================

export interface CameraState {
  /** Camera position in world coordinates */
  position: THREE.Vector3;
  /** Camera target/look-at point */
  target: THREE.Vector3;
  /** Camera up vector */
  up: THREE.Vector3;
  /** Camera zoom factor */
  zoom: number;
  /** Field of view for perspective cameras */
  fov?: number;
  /** Near clipping plane */
  near: number;
  /** Far clipping plane */
  far: number;
  /** Camera projection matrix (computed) */
  projectionMatrix?: THREE.Matrix4;
}

export interface RenderSettings {
  /** Overall rendering quality */
  quality: RenderQuality;
  /** Wireframe mode */
  wireframe: boolean;
  /** Shaded/solid mode */
  shaded: boolean;
  /** Enable shadows */
  shadows: boolean;
  /** Show grid */
  grid: boolean;
  /** Show coordinate axes */
  axes: boolean;
  /** Show edges */
  edges: boolean;
  /** Background color */
  backgroundColor: string;
  /** Anti-aliasing */
  antialias: boolean;
  /** Level of detail distance factor */
  lodBias: number;
}

export interface ViewportConfig {
  /** Unique viewport identifier */
  id: string;
  /** Type of viewport view */
  type: ViewportType;
  /** Display name for UI */
  name: string;
  /** Grid position in layout */
  position: { row: number; col: number };
  /** Viewport size (flex basis or pixels) */
  size: { width: number | string; height: number | string };
  /** Camera state */
  camera: CameraState;
  /** Rendering configuration */
  renderSettings: RenderSettings;
  /** Whether viewport is currently active/focused */
  active: boolean;
  /** Whether viewport is visible */
  visible: boolean;
  /** Whether viewport can be resized */
  resizable: boolean;
  /** Whether viewport can be closed */
  closable: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Custom viewport data */
  userData?: Record<string, any>;
}

// =============================================================================
// Layout & Grid Configuration
// =============================================================================

export interface ViewportGrid {
  /** Number of rows */
  rows: number;
  /** Number of columns */
  cols: number;
  /** Gap between viewports */
  gap: number;
  /** Individual cell configurations */
  cells: ViewportGridCell[];
}

export interface ViewportGridCell {
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
  /** Row span */
  rowSpan: number;
  /** Column span */
  colSpan: number;
  /** Viewport ID occupying this cell */
  viewportId: string;
}

export interface CustomLayoutConfig {
  /** Layout identifier */
  id: string;
  /** Display name */
  name: string;
  /** Layout description */
  description?: string;
  /** Grid configuration */
  grid: ViewportGrid;
  /** Default viewport configurations */
  defaultViewports: ViewportConfig[];
  /** Layout metadata */
  metadata?: {
    created: Date;
    modified: Date;
    author?: string;
    version?: string;
  };
}

// =============================================================================
// Multi-Viewport State Management
// =============================================================================

export interface MultiViewportState {
  /** Current layout mode */
  layout: ViewportLayout;
  /** Custom layout configuration (if layout === 'custom') */
  customLayout?: CustomLayoutConfig;
  /** All viewport configurations */
  viewports: Record<string, ViewportConfig>;
  /** Currently active/focused viewport */
  activeViewport: string;
  /** Camera synchronization mode */
  syncMode: SyncMode;
  /** Master viewport for synchronization */
  syncMaster?: string;
  /** Whether to share geometry instances */
  sharedGeometry: boolean;
  /** Performance optimization mode */
  performanceMode: PerformanceMode;
  /** Global render settings override */
  globalRenderSettings?: Partial<RenderSettings>;
  /** Layout transition animation */
  animateTransitions: boolean;
  /** Viewport interaction locks */
  interactionLocks: Record<string, boolean>;
}

// =============================================================================
// Performance & Memory Management
// =============================================================================

export interface ViewportPerformanceConfig {
  /** Maximum memory usage per viewport (MB) */
  maxMemoryPerViewport: number;
  /** Target frame rate */
  targetFPS: number;
  /** Enable adaptive LOD */
  adaptiveLOD: boolean;
  /** LOD distance thresholds */
  lodThresholds: number[];
  /** Enable frustum culling */
  frustumCulling: boolean;
  /** Enable occlusion culling */
  occlusionCulling: boolean;
  /** Texture resolution limits by quality */
  textureResolution: Record<RenderQuality, number>;
  /** Shadow map resolution */
  shadowMapSize: number;
  /** Enable render statistics */
  enableStats: boolean;
}

export interface ViewportStats {
  /** Frames per second */
  fps: number;
  /** Frame render time (ms) */
  frameTime: number;
  /** Memory usage (MB) */
  memoryUsage: number;
  /** Triangle count */
  triangles: number;
  /** Draw calls */
  drawCalls: number;
  /** Active viewports */
  activeViewports: number;
  /** Geometry instances */
  geometryInstances: number;
  /** Last update timestamp */
  timestamp: number;
}

// =============================================================================
// Geometry & Rendering
// =============================================================================

export interface SharedGeometryInstance {
  /** Unique geometry identifier */
  id: string;
  /** Source node ID */
  nodeId: string;
  /** Shared Three.js geometry */
  geometry: THREE.BufferGeometry;
  /** Base material */
  baseMaterial: THREE.Material;
  /** Mesh instances across viewports */
  meshInstances: Map<string, THREE.Mesh>;
  /** LOD geometries */
  lodGeometries?: THREE.BufferGeometry[];
  /** Reference count */
  refCount: number;
  /** Memory footprint (bytes) */
  memorySize: number;
}

export interface ViewportRenderTarget {
  /** Viewport ID */
  viewportId: string;
  /** Three.js render target */
  target?: THREE.WebGLRenderTarget;
  /** Canvas element */
  canvas: HTMLCanvasElement;
  /** Renderer instance */
  renderer: THREE.WebGLRenderer;
  /** Scene instance */
  scene: THREE.Scene;
  /** Camera instance */
  camera: THREE.Camera;
  /** Controls instance */
  controls: any; // OrbitControls | OrthographicControls
  /** Render priority */
  priority: number;
  /** Last render timestamp */
  lastRender: number;
  /** Requires rerender */
  needsUpdate: boolean;
}

// =============================================================================
// Camera Synchronization
// =============================================================================

export interface CameraSyncConstraints {
  /** Allow rotation sync for this viewport type */
  allowRotationSync: boolean;
  /** Allow pan sync for this viewport type */
  allowPanSync: boolean;
  /** Allow zoom sync for this viewport type */
  allowZoomSync: boolean;
  /** Custom sync transformation matrix */
  syncTransform?: THREE.Matrix4;
  /** Axis constraints for orthographic views */
  axisConstraints?: {
    lockX?: boolean;
    lockY?: boolean;
    lockZ?: boolean;
  };
}

export interface SyncEvent {
  /** Source viewport ID */
  sourceViewport: string;
  /** Target viewport IDs */
  targetViewports: string[];
  /** Sync operation type */
  operation: 'rotation' | 'pan' | 'zoom' | 'full';
  /** Camera state delta */
  cameraDelta: Partial<CameraState>;
  /** Event timestamp */
  timestamp: number;
  /** Whether event should propagate */
  propagate: boolean;
}

// =============================================================================
// Event Interfaces
// =============================================================================

export interface ViewportInteractionEvent {
  /** Viewport ID */
  viewportId: string;
  /** Event type */
  type: 'mouse' | 'keyboard' | 'touch' | 'wheel';
  /** Original DOM event */
  originalEvent: Event;
  /** 3D world coordinates (if applicable) */
  worldPosition?: THREE.Vector3;
  /** Screen coordinates */
  screenPosition: { x: number; y: number };
  /** Intersected objects */
  intersections?: THREE.Intersection[];
  /** Modifier keys */
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface ViewportSelectionEvent {
  /** Viewport ID */
  viewportId: string;
  /** Selected object IDs */
  selectedIds: string[];
  /** Selection mode */
  mode: 'single' | 'multi' | 'box' | 'lasso';
  /** Selection box (for box selection) */
  selectionBox?: {
    min: { x: number; y: number };
    max: { x: number; y: number };
  };
  /** Whether selection should sync across viewports */
  syncSelection: boolean;
}

export interface ViewportMeasurementEvent {
  /** Viewport ID */
  viewportId: string;
  /** Measurement type */
  type: 'distance' | 'angle' | 'radius' | 'area' | 'volume';
  /** Measurement points */
  points: THREE.Vector3[];
  /** Calculated value */
  value: number;
  /** Unit of measurement */
  unit: string;
  /** Display in all viewports */
  global: boolean;
}

// =============================================================================
// Manager Interfaces
// =============================================================================

export interface IViewportLayoutManager {
  // Layout Management
  setLayout(layout: ViewportLayout): Promise<void>;
  getLayout(): ViewportLayout;
  setCustomLayout(config: CustomLayoutConfig): Promise<void>;
  getCustomLayout(): CustomLayoutConfig | null;
  saveLayout(name: string): Promise<string>;
  loadLayout(id: string): Promise<void>;
  deleteLayout(id: string): Promise<void>;
  listLayouts(): CustomLayoutConfig[];

  // Viewport Management
  addViewport(config: ViewportConfig): Promise<string>;
  removeViewport(id: string): Promise<void>;
  updateViewport(id: string, updates: Partial<ViewportConfig>): Promise<void>;
  getViewport(id: string): ViewportConfig | null;
  getAllViewports(): ViewportConfig[];
  duplicateViewport(id: string): Promise<string>;

  // State Management
  setActiveViewport(id: string): void;
  getActiveViewport(): ViewportConfig | null;
  getState(): MultiViewportState;
  setState(state: Partial<MultiViewportState>): Promise<void>;
  resetToDefaults(): Promise<void>;

  // Events
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}

export interface IGeometryManager {
  // Geometry Sharing
  shareGeometry(nodeId: string, geometry: THREE.BufferGeometry): Promise<SharedGeometryInstance>;
  unshareGeometry(nodeId: string): Promise<void>;
  getSharedGeometry(nodeId: string): SharedGeometryInstance | null;
  createMeshInstance(geometryId: string, viewportId: string): THREE.Mesh | null;
  destroyMeshInstance(geometryId: string, viewportId: string): void;

  // Memory Management
  cleanup(): Promise<void>;
  getMemoryUsage(): number;
  setMemoryLimit(limitMB: number): void;
  optimizeMemory(): Promise<void>;

  // LOD Management
  generateLODs(geometry: THREE.BufferGeometry, levels: number[]): THREE.BufferGeometry[];
  updateLOD(viewportId: string, distance: number): void;
  setLODThresholds(thresholds: number[]): void;

  // Statistics
  getStats(): {
    sharedGeometries: number;
    totalInstances: number;
    memoryUsage: number;
    lodLevels: number;
  };
}

export interface ICameraSyncManager {
  // Synchronization Control
  setSyncMode(mode: SyncMode, masterViewport?: string): void;
  getSyncMode(): SyncMode;
  setSyncMaster(viewportId: string): void;
  getSyncMaster(): string | null;
  addViewportToSync(viewportId: string): void;
  removeViewportFromSync(viewportId: string): void;
  getSyncedViewports(): string[];

  // Camera Operations
  syncCameras(sourceViewport: string, operation: 'rotation' | 'pan' | 'zoom' | 'full'): void;
  setSyncConstraints(viewportId: string, constraints: CameraSyncConstraints): void;
  getSyncConstraints(viewportId: string): CameraSyncConstraints | null;

  // Events
  onCameraChange(viewportId: string, camera: CameraState): void;
  onUserInteraction(viewportId: string, event: ViewportInteractionEvent): void;

  // State
  isSyncing(): boolean;
  pauseSync(): void;
  resumeSync(): void;
}

export interface IViewportRenderer {
  // Render Management
  render(): void;
  renderViewport(viewportId: string, force?: boolean): void;
  setRenderOrder(viewportIds: string[]): void;
  pauseRendering(): void;
  resumeRendering(): void;

  // Performance
  setPerformanceMode(mode: PerformanceMode): void;
  getPerformanceMode(): PerformanceMode;
  setTargetFPS(fps: number): void;
  getStats(): ViewportStats;

  // Quality Control
  setGlobalQuality(quality: RenderQuality): void;
  setViewportQuality(viewportId: string, quality: RenderQuality): void;
  enableAdaptiveQuality(enable: boolean): void;

  // Render Targets
  createRenderTarget(viewportId: string, canvas: HTMLCanvasElement): ViewportRenderTarget;
  destroyRenderTarget(viewportId: string): void;
  resizeRenderTarget(viewportId: string, width: number, height: number): void;
}

// =============================================================================
// React Component Props
// =============================================================================

export interface ViewportInstanceProps {
  /** Viewport configuration */
  config: ViewportConfig;
  /** Geometry manager instance */
  geometryManager: IGeometryManager;
  /** Camera sync manager instance */
  syncManager: ICameraSyncManager;
  /** Renderer instance */
  renderer: IViewportRenderer;
  /** Event handlers */
  onConfigChange?: (config: Partial<ViewportConfig>) => void;
  onInteraction?: (event: ViewportInteractionEvent) => void;
  onSelection?: (event: ViewportSelectionEvent) => void;
  onMeasurement?: (event: ViewportMeasurementEvent) => void;
  onCameraChange?: (camera: CameraState) => void;
  /** Custom children (tools, overlays) */
  children?: React.ReactNode;
  /** CSS class names */
  className?: string;
}

export interface MultiViewportLayoutProps {
  /** Current layout configuration */
  layout: ViewportLayout;
  /** Custom layout (if layout === 'custom') */
  customLayout?: CustomLayoutConfig;
  /** Viewport configurations */
  viewports: ViewportConfig[];
  /** Active viewport ID */
  activeViewport: string;
  /** Sync mode */
  syncMode: SyncMode;
  /** Performance configuration */
  performanceConfig?: ViewportPerformanceConfig;

  // Event handlers
  onLayoutChange?: (layout: ViewportLayout) => void;
  onCustomLayoutChange?: (config: CustomLayoutConfig) => void;
  onViewportChange?: (id: string, config: Partial<ViewportConfig>) => void;
  onActiveViewportChange?: (id: string) => void;
  onSyncModeChange?: (mode: SyncMode) => void;
  onViewportAdd?: (config: ViewportConfig) => void;
  onViewportRemove?: (id: string) => void;

  // Shared managers
  layoutManager?: IViewportLayoutManager;
  geometryManager?: IGeometryManager;
  syncManager?: ICameraSyncManager;
  renderer?: IViewportRenderer;

  /** CSS class names */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface ViewportControlsProps {
  /** Current layout */
  layout: ViewportLayout;
  /** Available layouts */
  availableLayouts: ViewportLayout[];
  /** Custom layouts */
  customLayouts: CustomLayoutConfig[];
  /** Current sync mode */
  syncMode: SyncMode;
  /** Whether sync is active */
  syncActive: boolean;
  /** Performance mode */
  performanceMode: PerformanceMode;
  /** Performance stats */
  stats?: ViewportStats;

  // Event handlers
  onLayoutChange?: (layout: ViewportLayout) => void;
  onSyncModeChange?: (mode: SyncMode) => void;
  onPerformanceModeChange?: (mode: PerformanceMode) => void;
  onSaveLayout?: (name: string) => void;
  onLoadLayout?: (id: string) => void;
  onResetLayout?: () => void;

  /** Position of controls */
  position?: 'top' | 'bottom' | 'floating';
  /** Whether controls are visible */
  visible?: boolean;
  /** CSS class names */
  className?: string;
}

// =============================================================================
// Extension & Plugin Interfaces
// =============================================================================

export interface ViewportPlugin {
  /** Plugin identifier */
  id: string;
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Supported viewport types */
  supportedTypes?: ViewportType[];

  // Lifecycle
  initialize?(manager: IViewportLayoutManager): void;
  destroy?(): void;

  // Hooks
  onViewportCreate?(viewport: ViewportConfig): void;
  onViewportDestroy?(viewportId: string): void;
  onCameraChange?(viewportId: string, camera: CameraState): void;
  onRender?(viewportId: string, renderer: THREE.WebGLRenderer): void;

  // Custom functionality
  getCustomTools?(): any[];
  getCustomControls?(): React.ComponentType<any>[];
}

export interface ViewportTheme {
  /** Theme identifier */
  id: string;
  /** Theme name */
  name: string;
  /** Color scheme */
  colors: {
    background: string;
    grid: string;
    axes: string;
    text: string;
    accent: string;
    selection: string;
    highlight: string;
  };
  /** UI styling */
  ui: {
    borderRadius: number;
    borderWidth: number;
    fontSize: number;
    spacing: number;
  };
  /** Viewport-specific styling */
  viewport: {
    activeIndicator: string;
    resizeHandle: string;
    syncIndicator: string;
  };
}

// =============================================================================
// Utility Types
// =============================================================================

export type ViewportEventMap = {
  'layout:change': { layout: ViewportLayout };
  'viewport:add': { viewport: ViewportConfig };
  'viewport:remove': { viewportId: string };
  'viewport:update': { viewportId: string; config: Partial<ViewportConfig> };
  'viewport:activate': { viewportId: string };
  'camera:change': { viewportId: string; camera: CameraState };
  'sync:change': { mode: SyncMode; master?: string };
  'performance:update': { stats: ViewportStats };
  'selection:change': { event: ViewportSelectionEvent };
  'measurement:add': { event: ViewportMeasurementEvent };
  interaction: { event: ViewportInteractionEvent };
};

export type ViewportEventHandler<T extends keyof ViewportEventMap> = (
  data: ViewportEventMap[T]
) => void;

// Default configurations
export const DEFAULT_VIEWPORT_CONFIG: Omit<ViewportConfig, 'id' | 'type' | 'position'> = {
  name: 'Viewport',
  size: { width: '100%', height: '100%' },
  camera: {
    position: new THREE.Vector3(100, 100, 100),
    target: new THREE.Vector3(0, 0, 0),
    up: new THREE.Vector3(0, 1, 0),
    zoom: 1,
    fov: 75,
    near: 0.1,
    far: 10000,
  },
  renderSettings: {
    quality: 'high',
    wireframe: false,
    shaded: true,
    shadows: true,
    grid: true,
    axes: true,
    edges: false,
    backgroundColor: '#1e1e1e',
    antialias: true,
    lodBias: 1.0,
  },
  active: false,
  visible: true,
  resizable: true,
  closable: true,
};

export const DEFAULT_PERFORMANCE_CONFIG: ViewportPerformanceConfig = {
  maxMemoryPerViewport: 512,
  targetFPS: 60,
  adaptiveLOD: true,
  lodThresholds: [100, 500, 1000],
  frustumCulling: true,
  occlusionCulling: false,
  textureResolution: {
    low: 256,
    medium: 512,
    high: 1024,
    ultra: 2048,
  },
  shadowMapSize: 1024,
  enableStats: true,
};
