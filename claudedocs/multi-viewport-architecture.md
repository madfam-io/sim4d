# Multi-Viewport Architecture Design

**Phase 2: Enterprise-Grade Multi-Viewport CAD Interface**

## Executive Summary

Transform BrepFlow from single viewport to professional CAD multi-viewport system supporting simultaneous Front/Top/Right/ISO views with independent camera controls, view synchronization, and shared geometry rendering optimizations.

## Current State Analysis

### Existing Components

- **Enhanced3DViewport.tsx**: Complete single viewport with tools, measurements, navigation
- **Viewport.tsx**: Three.js integration with OCCT geometry rendering
- **WorkbenchLayoutManager.tsx**: Resizable panel management system
- **Layout types**: Comprehensive panel configuration and layout management

### Strengths

✅ Robust single viewport with full CAD toolset
✅ Three.js + OCCT.wasm geometry pipeline
✅ Flexible panel layout system with `react-resizable-panels`
✅ Performance monitoring and optimization hooks
✅ Professional CAD UI patterns and measurement tools

### Gaps

❌ Single viewport limitation
❌ No multi-view camera synchronization
❌ No shared geometry optimization across views
❌ No viewport layout templates (quad view, etc.)

## Architecture Design

### 1. Component Hierarchy

```
ViewportLayoutManager
├── ViewportGrid                     // 2x2, 1x2, custom layouts
│   ├── ViewportInstance            // Individual viewport container
│   │   ├── ViewportCanvas          // Three.js renderer + controls
│   │   ├── ViewportOverlay         // HUD elements (coordinates, etc.)
│   │   └── ViewportTools           // Per-viewport tool state
│   └── SharedViewportControls      // Cross-viewport sync controls
├── GeometryManager                 // Shared geometry instances
└── CameraSyncManager              // Camera synchronization system
```

### 2. Core Interfaces

```typescript
// Viewport Configuration
export type ViewportType = 'perspective' | 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left';
export type ViewportLayout = 'single' | 'quad' | 'horizontal' | 'vertical' | 'custom';
export type SyncMode = 'none' | 'rotation' | 'pan' | 'zoom' | 'full';

export interface ViewportConfig {
  id: string;
  type: ViewportType;
  position: { row: number; col: number };
  size: { width: number; height: number };
  camera: CameraState;
  renderSettings: RenderSettings;
  active: boolean;
  visible: boolean;
}

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  up: THREE.Vector3;
  zoom: number;
  fov?: number; // For perspective cameras
}

export interface RenderSettings {
  quality: 'low' | 'medium' | 'high';
  wireframe: boolean;
  shaded: boolean;
  shadows: boolean;
  grid: boolean;
  axes: boolean;
}

// Multi-Viewport State
export interface MultiViewportState {
  layout: ViewportLayout;
  viewports: Record<string, ViewportConfig>;
  activeViewport: string;
  syncMode: SyncMode;
  sharedGeometry: boolean;
  performanceMode: 'quality' | 'performance' | 'balanced';
}
```

### 3. Performance Architecture

#### Shared Geometry System

```typescript
export class GeometryManager {
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private instanceGroups = new Map<string, THREE.Group>();

  // Single geometry instance, multiple mesh references
  shareGeometry(nodeId: string, geometry: THREE.BufferGeometry): THREE.Mesh[] {
    this.geometryCache.set(nodeId, geometry);
    return this.createMeshInstances(nodeId);
  }

  // LOD management for background viewports
  setLOD(viewportId: string, level: 'high' | 'medium' | 'low'): void {
    // Adjust geometry complexity based on viewport priority
  }
}
```

#### Render Loop Optimization

```typescript
export class MultiViewportRenderer {
  private renderQueue: ViewportInstance[] = [];
  private activeViewports = new Set<string>();

  // Selective rendering - only update visible/active viewports
  render(): void {
    const visibleViewports = this.getVisibleViewports();
    const activeViewport = this.getActiveViewport();

    // High priority: Active viewport
    if (activeViewport) {
      this.renderViewport(activeViewport, 'high');
    }

    // Medium priority: Other visible viewports
    visibleViewports.forEach((viewport) => {
      if (viewport.id !== activeViewport?.id) {
        this.renderViewport(viewport, 'medium');
      }
    });
  }

  // Adaptive quality based on performance
  renderViewport(viewport: ViewportInstance, priority: 'high' | 'medium' | 'low'): void {
    const quality = this.getQualityForPriority(priority);
    viewport.setRenderQuality(quality);
    viewport.render();
  }
}
```

### 4. Camera Synchronization System

```typescript
export class CameraSyncManager {
  private syncMode: SyncMode = 'none';
  private masterViewport: string | null = null;
  private viewports = new Map<string, ViewportInstance>();

  setSyncMode(mode: SyncMode, masterViewport?: string): void {
    this.syncMode = mode;
    this.masterViewport = masterViewport || this.getActiveViewport();
    this.applySynchronization();
  }

  private applySynchronization(): void {
    if (this.syncMode === 'none' || !this.masterViewport) return;

    const master = this.viewports.get(this.masterViewport);
    if (!master) return;

    this.viewports.forEach((viewport, id) => {
      if (id === this.masterViewport) return;

      switch (this.syncMode) {
        case 'rotation':
          this.syncRotation(master, viewport);
          break;
        case 'pan':
          this.syncPan(master, viewport);
          break;
        case 'zoom':
          this.syncZoom(master, viewport);
          break;
        case 'full':
          this.syncFull(master, viewport);
          break;
      }
    });
  }

  private syncRotation(master: ViewportInstance, slave: ViewportInstance): void {
    // Sync camera orientation while preserving orthographic projections
    const masterCam = master.getCamera();
    const slaveCam = slave.getCamera();

    if (slave.getType() === 'perspective') {
      // Direct rotation sync for perspective views
      slaveCam.position.copy(masterCam.position);
      slaveCam.lookAt(masterCam.getWorldDirection(new THREE.Vector3()));
    } else {
      // Adapt rotation for orthographic views
      this.adaptRotationForOrthographic(masterCam, slaveCam, slave.getType());
    }
  }
}
```

## Implementation Plan

### Phase 2.1: Foundation (Week 1-2)

1. **Create core multi-viewport components**
   - `ViewportLayoutManager` with layout grid system
   - `ViewportInstance` wrapping existing functionality
   - `GeometryManager` for shared geometry

2. **Extend layout system**
   - Add viewport layout types to `layout.ts`
   - Update `WorkbenchLayoutManager` integration
   - Create viewport layout presets (quad, horizontal, etc.)

### Phase 2.2: Camera System (Week 3)

1. **Camera state management**
   - Standardized camera state interface
   - Orthographic camera implementations
   - View type enforcement (front = -Z axis, etc.)

2. **Synchronization engine**
   - `CameraSyncManager` implementation
   - Sync mode controls UI
   - Cross-viewport interaction handling

### Phase 2.3: Performance Optimization (Week 4)

1. **Shared geometry system**
   - Geometry instance sharing across viewports
   - LOD system for background views
   - Memory pool management

2. **Selective rendering**
   - Render queue with priority system
   - Adaptive quality scaling
   - Performance monitoring integration

### Phase 2.4: UI Integration (Week 5)

1. **Layout controls**
   - Viewport layout switcher
   - Per-viewport settings panels
   - Sync mode toggles

2. **Enhanced functionality**
   - Cross-viewport measurements
   - Multi-view selection highlighting
   - Unified tool state management

## Technical Implementation Details

### 1. Viewport Layout Management

```typescript
export interface ViewportLayoutManager {
  // Layout management
  setLayout(layout: ViewportLayout): void;
  getLayout(): ViewportLayout;
  customizeLayout(config: CustomLayoutConfig): void;

  // Viewport management
  addViewport(config: ViewportConfig): string;
  removeViewport(id: string): void;
  updateViewport(id: string, updates: Partial<ViewportConfig>): void;

  // State management
  setActiveViewport(id: string): void;
  getActiveViewport(): ViewportInstance | null;
  getAllViewports(): ViewportInstance[];
}
```

### 2. Integration with Existing Systems

#### Enhanced3DViewport Integration

```typescript
// Extend existing Enhanced3DViewport for multi-viewport context
export interface EnhancedViewportProps extends ViewportProps {
  viewportId: string;
  viewportType: ViewportType;
  syncManager?: CameraSyncManager;
  geometryManager?: GeometryManager;
  isActive?: boolean;
  renderQuality?: 'high' | 'medium' | 'low';
}
```

#### WorkbenchLayoutManager Integration

```typescript
// Add viewport panels to layout system
export type PanelId =
  | 'nodePanel'
  | 'nodeEditor'
  | 'viewport3d' // Single viewport (backward compatibility)
  | 'multiViewport' // Multi-viewport container
  | 'inspector'
  | 'console'
  | 'toolbar';
```

### 3. Performance Optimization Strategies

#### Memory Management

```typescript
export class ViewportMemoryManager {
  private texturePool = new TexturePool();
  private geometryPool = new GeometryPool();
  private materialPool = new MaterialPool();

  // Automatic cleanup of unused resources
  cleanup(): void {
    this.texturePool.cleanup();
    this.geometryPool.cleanup();
    this.materialPool.cleanup();
  }

  // Memory pressure handling
  handleMemoryPressure(): void {
    this.reduceQuality();
    this.clearCaches();
    this.requestGarbageCollection();
  }
}
```

#### Render Optimization

```typescript
export class ViewportRenderOptimizer {
  // Frustum culling per viewport
  cullGeometry(viewport: ViewportInstance): THREE.Object3D[] {
    const camera = viewport.getCamera();
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(camera.projectionMatrix);

    return this.sceneObjects.filter((obj) => frustum.intersectsObject(obj));
  }

  // Adaptive LOD based on viewport size and distance
  updateLOD(viewport: ViewportInstance): void {
    const camera = viewport.getCamera();
    const viewportSize = viewport.getSize();

    this.lodObjects.forEach((obj) => {
      const distance = camera.position.distanceTo(obj.position);
      const lodLevel = this.calculateLOD(distance, viewportSize);
      obj.setLOD(lodLevel);
    });
  }
}
```

## Interface Specifications

### ViewportInstance Component

```typescript
export class ViewportInstance extends React.Component<ViewportInstanceProps> {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private controls: OrbitControls | OrthographicControls;
  private scene: THREE.Scene;

  // Core functionality
  render(): void;
  resize(width: number, height: number): void;
  setCamera(camera: THREE.Camera): void;
  getCamera(): THREE.Camera;

  // Synchronization
  syncWith(other: ViewportInstance, mode: SyncMode): void;
  unsync(): void;

  // Performance
  setRenderQuality(quality: 'high' | 'medium' | 'low'): void;
  setLODLevel(level: number): void;

  // Interaction
  setActive(active: boolean): void;
  setVisible(visible: boolean): void;
  handleUserInteraction(event: InteractionEvent): void;
}
```

### Layout System Integration

```typescript
export interface MultiViewportLayoutProps {
  layout: ViewportLayout;
  viewports: ViewportConfig[];
  onLayoutChange: (layout: ViewportLayout) => void;
  onViewportChange: (id: string, config: Partial<ViewportConfig>) => void;
  onSyncModeChange: (mode: SyncMode) => void;
}

export const MultiViewportLayout: React.FC<MultiViewportLayoutProps> = ({
  layout,
  viewports,
  onLayoutChange,
  onViewportChange,
  onSyncModeChange
}) => {
  // Implementation using react-resizable-panels for flexible layouts
  return (
    <PanelGroup direction={getDirectionForLayout(layout)}>
      {viewports.map(viewport => (
        <Panel key={viewport.id} defaultSize={viewport.size.width}>
          <ViewportInstance
            config={viewport}
            onChange={(updates) => onViewportChange(viewport.id, updates)}
          />
        </Panel>
      ))}
    </PanelGroup>
  );
};
```

## Success Metrics

### Performance Targets

- **Multi-viewport render**: 4 viewports @ 30+ FPS with full geometry
- **Memory efficiency**: <25% increase over single viewport
- **Sync latency**: <16ms camera synchronization delay
- **Layout switching**: <100ms transition between layouts

### User Experience Goals

- **Seamless interaction**: Natural CAD workflow across multiple views
- **Professional feel**: Industry-standard multi-viewport behavior
- **Flexible layouts**: Easy customization and preset management
- **Performance awareness**: Automatic quality scaling under load

### Technical Standards

- **Backward compatibility**: Existing single viewport functionality preserved
- **Clean architecture**: Modular, testable component design
- **Resource efficiency**: Shared geometry with minimal overhead
- **Extensibility**: Plugin-ready viewport customization system

## Conclusion

This multi-viewport architecture transforms BrepFlow into a professional CAD application with enterprise-grade viewport management. The design leverages existing Three.js infrastructure while adding sophisticated camera synchronization, shared geometry optimization, and flexible layout management.

Key innovations:

- **Performance-first design** with shared geometry and selective rendering
- **Professional synchronization** with orthographic view preservation
- **Flexible layout system** building on existing panel management
- **Seamless integration** with current Enhanced3DViewport functionality

The incremental implementation plan ensures stable development while maintaining existing functionality throughout the transition.
