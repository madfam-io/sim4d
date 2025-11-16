# Multi-Viewport Implementation Plan

**Phase 2: Enterprise-Grade Multi-Viewport Development Strategy**

## Overview

Incremental implementation plan for transforming BrepFlow from single viewport to professional CAD multi-viewport system. This plan ensures backward compatibility while delivering enterprise-grade functionality.

## Development Phases

### Phase 2.1: Foundation & Core Components (Week 1-2)

**Goal**: Create multi-viewport foundation without breaking existing functionality

#### 2.1.1: Core Interface Implementation

```
Day 1-2: Interface & Type Definitions
├── Create multi-viewport-interfaces.ts (✅ Complete)
├── Extend layout.ts with viewport types
├── Update PanelId to include 'multiViewport'
└── Create viewport-specific utility functions

Day 3-4: Base Component Structure
├── ViewportLayoutManager.tsx (container component)
├── ViewportInstance.tsx (wrapper around Enhanced3DViewport)
├── ViewportGrid.tsx (layout grid system)
└── MultiViewportControls.tsx (layout switching UI)
```

**File Structure**:

```
packages/viewport/src/
├── multi-viewport/
│   ├── index.ts
│   ├── ViewportLayoutManager.tsx
│   ├── ViewportInstance.tsx
│   ├── ViewportGrid.tsx
│   ├── MultiViewportControls.tsx
│   ├── managers/
│   │   ├── GeometryManager.ts
│   │   ├── CameraSyncManager.ts
│   │   └── ViewportRenderer.ts
│   ├── layouts/
│   │   ├── QuadLayout.tsx
│   │   ├── HorizontalLayout.tsx
│   │   └── CustomLayout.tsx
│   └── utils/
│       ├── camera-utils.ts
│       ├── sync-utils.ts
│       └── performance-utils.ts
```

#### 2.1.2: Layout System Integration

```typescript
// Update apps/studio/src/types/layout.ts
export type PanelId =
  | 'nodePanel'
  | 'nodeEditor'
  | 'viewport3d' // Single viewport (legacy)
  | 'multiViewport' // New multi-viewport panel
  | 'inspector'
  | 'console'
  | 'toolbar';

// Add viewport-specific layout types
export interface ViewportPanelConfig extends PanelConfig {
  viewportLayout?: ViewportLayout;
  viewportConfigs?: ViewportConfig[];
  syncMode?: SyncMode;
}
```

#### 2.1.3: Backward Compatibility Layer

```typescript
// Create compatibility wrapper
export const EnhancedViewportWrapper: React.FC<ViewportProps> = (props) => {
  const isMultiViewport = useLayoutStore(state =>
    state.currentLayout.panels.multiViewport?.visible
  );

  if (isMultiViewport) {
    return <MultiViewportLayout {...props} />;
  }

  return <Enhanced3DViewport {...props} />;
};
```

**Deliverables**:

- ✅ Complete interface definitions
- 🔄 Basic component structure with TypeScript shells
- 🔄 Layout system integration points
- 🔄 Backward compatibility wrapper
- 🔄 Unit tests for core interfaces

### Phase 2.2: Geometry Management & Sharing (Week 3)

**Goal**: Implement shared geometry system for performance optimization

#### 2.2.1: GeometryManager Implementation

```typescript
// packages/viewport/src/multi-viewport/managers/GeometryManager.ts
export class GeometryManager implements IGeometryManager {
  private geometryCache = new Map<string, SharedGeometryInstance>();
  private memoryPool = new MemoryPool();
  private lodGenerator = new LODGenerator();

  async shareGeometry(
    nodeId: string,
    geometry: THREE.BufferGeometry
  ): Promise<SharedGeometryInstance> {
    // Implementation with memory management
  }

  createMeshInstance(geometryId: string, viewportId: string): THREE.Mesh | null {
    // Create view-specific mesh instances
  }

  // LOD generation and management
  generateLODs(geometry: THREE.BufferGeometry, levels: number[]): THREE.BufferGeometry[] {
    // Simplification algorithm implementation
  }
}
```

#### 2.2.2: Performance Optimization

```typescript
// Memory management with cleanup
export class ViewportMemoryManager {
  private maxMemoryPerViewport = 512; // MB
  private texturePool = new LRUCache<string, THREE.Texture>(100);
  private geometryPool = new LRUCache<string, THREE.BufferGeometry>(50);

  cleanup(): void {
    this.garbageCollectUnused();
    this.compactMemory();
    this.reportMemoryUsage();
  }

  private garbageCollectUnused(): void {
    // Remove unreferenced geometries and textures
  }
}
```

#### 2.2.3: Integration with OCCT Pipeline

```typescript
// Extend existing Viewport.tsx geometry pipeline
const updateSceneGeometry = useCallback(async () => {
  if (geometryManager && isMultiViewport) {
    // Use shared geometry manager
    for (const node of geometryNodes) {
      const shapeHandle = node.outputs?.shape?.value as ShapeHandle;
      const meshData = await dagEngine.geometryAPI.invoke('TESSELLATE', {
        shape: shapeHandle,
        deflection: 0.01,
      });

      // Share geometry across all viewports
      await geometryManager.shareGeometry(node.id, createBufferGeometry(meshData));
    }
  } else {
    // Fallback to existing single viewport logic
  }
}, [geometryManager, isMultiViewport]);
```

**Deliverables**:

- 🔄 GeometryManager with memory pooling
- 🔄 LOD generation system
- 🔄 Integration with existing OCCT pipeline
- 🔄 Performance monitoring hooks
- 🔄 Memory pressure handling

### Phase 2.3: Camera System & Synchronization (Week 4)

**Goal**: Professional camera synchronization with orthographic view support

#### 2.3.1: Camera State Management

```typescript
// Camera state normalization
export class CameraStateManager {
  normalize(camera: THREE.Camera): CameraState {
    // Standardize camera state across perspective/orthographic
  }

  applyState(camera: THREE.Camera, state: CameraState): void {
    // Apply normalized state to Three.js camera
  }

  createOrthographicCamera(type: ViewportType): THREE.OrthographicCamera {
    // Create constrained orthographic cameras for front/top/right views
  }
}
```

#### 2.3.2: Synchronization Engine

```typescript
// packages/viewport/src/multi-viewport/managers/CameraSyncManager.ts
export class CameraSyncManager implements ICameraSyncManager {
  private syncMode: SyncMode = 'none';
  private masterViewport: string | null = null;
  private constraints = new Map<string, CameraSyncConstraints>();

  setSyncMode(mode: SyncMode, masterViewport?: string): void {
    this.syncMode = mode;
    this.masterViewport = masterViewport || this.getActiveViewport();
    this.applySynchronization();
  }

  private syncRotation(master: ViewportInstance, slave: ViewportInstance): void {
    const masterCam = master.getCamera();
    const slaveCam = slave.getCamera();
    const slaveType = slave.getViewportType();

    if (slaveType === 'perspective') {
      // Direct rotation sync
      this.copyRotation(masterCam, slaveCam);
    } else {
      // Adapt rotation for orthographic views
      this.adaptRotationForOrthographic(masterCam, slaveCam, slaveType);
    }
  }

  private adaptRotationForOrthographic(
    masterCam: THREE.Camera,
    slaveCam: THREE.OrthographicCamera,
    viewType: ViewportType
  ): void {
    // Keep orthographic constraints while syncing logical rotation
    const worldDirection = masterCam.getWorldDirection(new THREE.Vector3());

    switch (viewType) {
      case 'front':
        // Maintain front view (-Z) while adapting up vector
        slaveCam.position.setFromMatrixPosition(masterCam.matrixWorld);
        slaveCam.position.z = slaveCam.position.length();
        slaveCam.lookAt(0, 0, 0);
        break;
      // Similar logic for top, right, etc.
    }
  }
}
```

#### 2.3.3: View Type Enforcement

```typescript
// Ensure orthographic views maintain proper constraints
export const VIEWPORT_CONSTRAINTS: Record<ViewportType, CameraSyncConstraints> = {
  front: {
    allowRotationSync: false, // Maintain front view
    allowPanSync: true,
    allowZoomSync: true,
    axisConstraints: { lockZ: true },
  },
  top: {
    allowRotationSync: false,
    allowPanSync: true,
    allowZoomSync: true,
    axisConstraints: { lockY: true },
  },
  perspective: {
    allowRotationSync: true,
    allowPanSync: true,
    allowZoomSync: true,
  },
  // ... other view types
};
```

**Deliverables**:

- 🔄 CameraSyncManager with orthographic support
- 🔄 View type constraint system
- 🔄 Smooth synchronization animations
- 🔄 User interaction handling during sync
- 🔄 Sync mode UI controls

### Phase 2.4: Layout & UI Integration (Week 5)

**Goal**: Complete UI integration with layout switching and controls

#### 2.4.1: Layout System Implementation

```typescript
// packages/viewport/src/multi-viewport/ViewportLayoutManager.tsx
export const ViewportLayoutManager: React.FC<MultiViewportLayoutProps> = ({
  layout,
  viewports,
  onLayoutChange,
  ...props
}) => {
  const layoutManager = useViewportLayoutManager();

  const renderLayout = useCallback(() => {
    switch (layout) {
      case 'single':
        return <SingleViewportLayout {...props} />;
      case 'quad':
        return <QuadViewportLayout viewports={viewports} {...props} />;
      case 'horizontal':
        return <HorizontalViewportLayout viewports={viewports} {...props} />;
      case 'custom':
        return <CustomViewportLayout config={customLayout} {...props} />;
      default:
        return <QuadViewportLayout viewports={viewports} {...props} />;
    }
  }, [layout, viewports, props]);

  return (
    <div className="viewport-layout-manager">
      <ViewportControls
        layout={layout}
        onLayoutChange={onLayoutChange}
        syncMode={syncMode}
        onSyncModeChange={onSyncModeChange}
      />
      {renderLayout()}
    </div>
  );
};
```

#### 2.4.2: Quad Layout Implementation

```typescript
// Pre-defined quad layout with standard CAD views
export const QuadViewportLayout: React.FC<QuadLayoutProps> = ({
  viewports,
  onViewportChange
}) => {
  const defaultQuadViewports: ViewportConfig[] = [
    {
      id: 'perspective',
      type: 'perspective',
      name: 'Perspective',
      position: { row: 0, col: 0 },
      size: { width: '50%', height: '50%' },
      // ... full config
    },
    {
      id: 'front',
      type: 'front',
      name: 'Front',
      position: { row: 0, col: 1 },
      size: { width: '50%', height: '50%' },
      // ... full config
    },
    {
      id: 'top',
      type: 'top',
      name: 'Top',
      position: { row: 1, col: 0 },
      size: { width: '50%', height: '50%' },
      // ... full config
    },
    {
      id: 'right',
      type: 'right',
      name: 'Right',
      position: { row: 1, col: 1 },
      size: { width: '50%', height: '50%' },
      // ... full config
    }
  ];

  return (
    <PanelGroup direction="vertical" className="quad-viewport-layout">
      <Panel defaultSize={50}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50}>
            <ViewportInstance config={defaultQuadViewports[0]} />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <ViewportInstance config={defaultQuadViewports[1]} />
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50}>
            <ViewportInstance config={defaultQuadViewports[2]} />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={50}>
            <ViewportInstance config={defaultQuadViewports[3]} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
};
```

#### 2.4.3: Viewport Controls UI

```typescript
// Multi-viewport controls with layout switching
export const ViewportControls: React.FC<ViewportControlsProps> = ({
  layout,
  syncMode,
  onLayoutChange,
  onSyncModeChange,
  stats
}) => {
  return (
    <div className="viewport-controls">
      {/* Layout Selector */}
      <div className="layout-controls">
        <select
          value={layout}
          onChange={(e) => onLayoutChange(e.target.value as ViewportLayout)}
        >
          <option value="single">Single View</option>
          <option value="quad">Quad View</option>
          <option value="horizontal">Horizontal Split</option>
          <option value="vertical">Vertical Split</option>
          <option value="custom">Custom Layout</option>
        </select>
      </div>

      {/* Sync Controls */}
      <div className="sync-controls">
        <label>Camera Sync:</label>
        <select
          value={syncMode}
          onChange={(e) => onSyncModeChange(e.target.value as SyncMode)}
        >
          <option value="none">None</option>
          <option value="rotation">Rotation</option>
          <option value="pan">Pan</option>
          <option value="zoom">Zoom</option>
          <option value="full">Full Sync</option>
        </select>
      </div>

      {/* Performance Monitor */}
      {stats && (
        <div className="performance-display">
          <span>FPS: {stats.fps.toFixed(0)}</span>
          <span>Viewports: {stats.activeViewports}</span>
          <span>Memory: {(stats.memoryUsage / 1024 / 1024).toFixed(0)}MB</span>
        </div>
      )}
    </div>
  );
};
```

#### 2.4.4: WorkbenchLayoutManager Integration

```typescript
// Update apps/studio/src/components/layout/WorkbenchLayoutManager.tsx
const renderPanelContent = (panelId: PanelId) => {
  switch (panelId) {
    case 'viewport3d':
      // Legacy single viewport
      return <Enhanced3DViewport {...viewportProps} />;
    case 'multiViewport':
      // New multi-viewport system
      return (
        <ViewportLayoutManager
          layout={viewportLayout}
          viewports={viewportConfigs}
          onLayoutChange={setViewportLayout}
          onViewportChange={updateViewportConfig}
          onSyncModeChange={setSyncMode}
        />
      );
    default:
      return children[panelId];
  }
};
```

**Deliverables**:

- 🔄 Complete ViewportLayoutManager implementation
- 🔄 Quad, horizontal, vertical layout templates
- 🔄 Multi-viewport controls UI
- 🔄 WorkbenchLayoutManager integration
- 🔄 Layout persistence and recovery

### Phase 2.5: Testing & Performance Optimization (Week 6)

**Goal**: Comprehensive testing and performance validation

#### 2.5.1: Unit & Integration Tests

```typescript
// packages/viewport/src/multi-viewport/__tests__/
describe('GeometryManager', () => {
  test('shares geometry across viewports efficiently', async () => {
    const manager = new GeometryManager();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const instance = await manager.shareGeometry('test-node', geometry);

    expect(instance.refCount).toBe(1);
    expect(instance.meshInstances.size).toBe(0);

    const mesh1 = manager.createMeshInstance('test-node', 'viewport1');
    const mesh2 = manager.createMeshInstance('test-node', 'viewport2');

    expect(mesh1?.geometry).toBe(mesh2?.geometry); // Same geometry reference
    expect(instance.meshInstances.size).toBe(2);
  });
});

describe('CameraSyncManager', () => {
  test('synchronizes rotation while preserving orthographic constraints', () => {
    const syncManager = new CameraSyncManager();
    const perspectiveViewport = createMockViewport('perspective');
    const frontViewport = createMockViewport('front');

    syncManager.setSyncMode('rotation', 'perspective');
    syncManager.addViewportToSync('front');

    // Rotate perspective camera
    perspectiveViewport.camera.position.set(100, 50, 100);
    perspectiveViewport.camera.lookAt(0, 0, 0);

    syncManager.onCameraChange('perspective', perspectiveViewport.camera);

    // Front view should maintain Z-axis constraint
    expect(frontViewport.camera.position.z).toBeGreaterThan(0);
    expect(frontViewport.camera.position.x).toBeCloseTo(0);
  });
});
```

#### 2.5.2: Performance Benchmarks

```typescript
// Performance testing suite
describe('Multi-Viewport Performance', () => {
  test('maintains 30+ FPS with 4 viewports and complex geometry', async () => {
    const layout = createQuadLayout();
    const complexGeometry = generateComplexGeometry(100000); // 100K triangles

    const performanceMonitor = new PerformanceMonitor();
    performanceMonitor.start();

    // Render for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const stats = performanceMonitor.getStats();
    expect(stats.averageFPS).toBeGreaterThan(30);
    expect(stats.memoryUsage).toBeLessThan(2 * 1024 * 1024 * 1024); // 2GB limit
  });

  test('memory usage scales linearly with viewport count', () => {
    const baselineMemory = measureSingleViewportMemory();
    const quadMemory = measureQuadViewportMemory();

    // Should be less than 4x due to geometry sharing
    expect(quadMemory).toBeLessThan(baselineMemory * 3);
  });
});
```

#### 2.5.3: E2E Testing with Playwright

```typescript
// tests/e2e/multi-viewport.spec.ts
import { test, expect } from '@playwright/test';

test('multi-viewport layout switching', async ({ page }) => {
  await page.goto('/');

  // Switch to quad layout
  await page.selectOption('[data-testid="layout-selector"]', 'quad');

  // Verify 4 viewport canvases are present
  const viewports = page.locator('[data-testid="viewport-canvas"]');
  await expect(viewports).toHaveCount(4);

  // Test camera synchronization
  await page.selectOption('[data-testid="sync-selector"]', 'rotation');

  // Interact with perspective viewport
  const perspectiveViewport = viewports.nth(0);
  await perspectiveViewport.dragTo(perspectiveViewport, {
    sourcePosition: { x: 100, y: 100 },
    targetPosition: { x: 150, y: 150 },
  });

  // Verify other viewports updated
  // (This would require specific camera position assertions)
});
```

**Deliverables**:

- 🔄 Comprehensive unit test suite (>80% coverage)
- 🔄 Performance benchmark suite
- 🔄 E2E test scenarios for all major workflows
- 🔄 Memory leak detection and prevention
- 🔄 Performance regression testing

## Integration Points

### 1. Layout System Integration

```typescript
// apps/studio/src/config/layout-presets.ts
export const LAYOUT_PRESETS: Record<LayoutPresetId, WorkbenchLayout> = {
  professional: {
    // Update to use multiViewport panel
    panels: {
      multiViewport: {
        visible: true,
        position: 'center',
        viewportLayout: 'quad',
        viewportConfigs: DEFAULT_QUAD_VIEWPORTS,
      },
    },
  },
};
```

### 2. State Management Integration

```typescript
// apps/studio/src/store/layout-store.ts
interface LayoutStoreExtended extends LayoutStore {
  // Viewport-specific state
  viewportLayout: ViewportLayout;
  viewportConfigs: Record<string, ViewportConfig>;
  syncMode: SyncMode;

  // Viewport actions
  setViewportLayout: (layout: ViewportLayout) => void;
  updateViewportConfig: (id: string, config: Partial<ViewportConfig>) => void;
  setSyncMode: (mode: SyncMode) => void;
}
```

### 3. Performance Monitoring Integration

```typescript
// apps/studio/src/hooks/useMonitoring.ts
export const useViewportMonitoring = () => {
  const [stats, setStats] = useState<ViewportStats>();

  useEffect(() => {
    const monitor = new ViewportPerformanceMonitor();
    monitor.on('stats', setStats);
    return () => monitor.destroy();
  }, []);

  return { stats };
};
```

## Migration Strategy

### Backward Compatibility

1. **Preserve existing Enhanced3DViewport** as single viewport option
2. **Gradual adoption** through layout presets
3. **Feature flag** for multi-viewport beta testing
4. **Migration tools** for converting saved layouts

### User Experience Transition

1. **Default to single viewport** for new users
2. **Professional preset** includes quad layout
3. **Progressive disclosure** of advanced features
4. **In-app tutorials** for multi-viewport workflows

### Performance Safeguards

1. **Automatic quality scaling** based on hardware detection
2. **Memory pressure handling** with graceful degradation
3. **Performance warnings** when approaching limits
4. **Fallback to single viewport** if performance drops

## Success Criteria

### Functional Requirements ✅

- [ ] Quad layout with Front/Top/Right/ISO viewports
- [ ] Independent camera controls per viewport
- [ ] Camera synchronization (rotation, pan, zoom, full)
- [ ] Shared geometry rendering optimization
- [ ] Flexible layout customization
- [ ] Seamless integration with existing tools

### Performance Requirements 📊

- [ ] 4 viewports @ 30+ FPS with complex geometry
- [ ] <25% memory increase over single viewport
- [ ] <16ms camera synchronization latency
- [ ] <100ms layout switching transitions
- [ ] Memory usage <2GB for typical workflows

### User Experience Requirements 🎯

- [ ] Professional CAD-grade multi-viewport behavior
- [ ] Intuitive layout switching and customization
- [ ] Preserved measurement and tool functionality across views
- [ ] Responsive performance on recommended hardware
- [ ] Backward compatibility with existing workflows

### Technical Requirements ⚙️

- [ ] Clean, maintainable component architecture
- [ ] Comprehensive test coverage (>80%)
- [ ] TypeScript interface completeness
- [ ] Plugin-ready extensibility
- [ ] Production-ready error handling

## Timeline Summary

| Phase | Duration | Key Deliverables        | Success Criteria                  |
| ----- | -------- | ----------------------- | --------------------------------- |
| 2.1   | Week 1-2 | Foundation & interfaces | Components render without errors  |
| 2.2   | Week 3   | Geometry management     | Shared geometry works efficiently |
| 2.3   | Week 4   | Camera synchronization  | Professional sync behavior        |
| 2.4   | Week 5   | UI integration          | Complete multi-viewport workflow  |
| 2.5   | Week 6   | Testing & optimization  | Performance targets met           |

**Total Duration**: 6 weeks for complete Phase 2 implementation

## Next Steps

1. **Architecture Review**: Validate technical approach with team
2. **Resource Allocation**: Assign developers to implementation phases
3. **Prototype Development**: Build Phase 2.1 foundation components
4. **User Testing**: Beta test with power users for feedback
5. **Production Deployment**: Gradual rollout with feature flags
