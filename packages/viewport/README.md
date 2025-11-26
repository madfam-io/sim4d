# @sim4d/viewport

Three.js-based WebGL2/WebGPU renderer for 3D visualization in Sim4D.

## Overview

The viewport package provides high-performance 3D rendering capabilities for Sim4D, built on Three.js with React Three Fiber integration. It supports:

- **Real-time rendering** - 60 FPS for ≤2M triangles
- **Multiple viewports** - Quad layout with independent cameras
- **Render modes** - Wireframe, shaded, textured, X-ray, realistic
- **Camera controls** - Orbit, pan, zoom, fly modes
- **Selection** - 3D picking and highlighting
- **Quality modes** - Adaptive quality based on performance
- **WebGL2/WebGPU** - Hardware-accelerated rendering

## Installation

```bash
pnpm add @sim4d/viewport
```

## Quick Start

### Basic Viewport

```typescript
import { ViewportRenderer } from '@sim4d/viewport';

const renderer = new ViewportRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
  shadows: true,
  powerPreference: 'high-performance',
});

// Add geometry
renderer.addMesh({
  id: 'box-1',
  vertices: vertices,
  indices: indices,
  normals: normals,
  color: '#4CAF50',
});

// Start render loop
renderer.startRendering();
```

### React Integration

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Enhanced3DViewport } from '@sim4d/viewport';

function App() {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} />
      <OrbitControls />
      <Enhanced3DViewport geometryData={geometryData} renderMode="shaded" />
    </Canvas>
  );
}
```

## API Reference

### ViewportRenderer

Main renderer class for viewport management.

#### Constructor

```typescript
new ViewportRenderer(options: ViewportOptions)
```

**Options:**

```typescript
interface ViewportOptions {
  canvas: HTMLCanvasElement;
  antialias?: boolean;           // Default: true
  shadows?: boolean;             // Default: true
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  alpha?: boolean;               // Transparent background
  preserveDrawingBuffer?: boolean; // For screenshots
  logarithmicDepthBuffer?: boolean; // Better depth precision
  outputColorSpace?: 'srgb' | 'linear';
}
```

#### Methods

##### Mesh Management

```typescript
// Add mesh to scene
renderer.addMesh(mesh: MeshData): void

// Update mesh geometry
renderer.updateMesh(id: string, geometry: Partial<MeshData>): void

// Remove mesh from scene
renderer.removeMesh(id: string): void

// Clear all meshes
renderer.clear(): void

// Show/hide mesh
renderer.setMeshVisibility(id: string, visible: boolean): void
```

**MeshData Interface:**

```typescript
interface MeshData {
  id: string;
  vertices: Float32Array;     // [x, y, z, x, y, z, ...]
  indices?: Uint32Array;      // Triangle indices
  normals?: Float32Array;     // Per-vertex normals
  uvs?: Float32Array;         // Texture coordinates
  colors?: Float32Array;      // Per-vertex colors
  color?: string;             // Mesh color (#RRGGBB)
  opacity?: number;           // 0.0 - 1.0
  wireframe?: boolean;
  metalness?: number;         // 0.0 - 1.0 (PBR)
  roughness?: number;         // 0.0 - 1.0 (PBR)
}
```

##### Camera Control

```typescript
// Get camera state
const camera = renderer.getCamera(): CameraState

// Set camera state
renderer.setCamera(state: CameraState): void

// Fit camera to view all geometry
renderer.fitToView(padding?: number): void

// Set camera to standard view
renderer.setStandardView(view: ViewType): void
```

**CameraState:**

```typescript
interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov?: number;    // Field of view (degrees)
  zoom?: number;   // Zoom factor
  near?: number;   // Near clipping plane
  far?: number;    // Far clipping plane
}

type ViewType =
  | 'perspective'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'iso';
```

##### Rendering Control

```typescript
// Start continuous rendering
renderer.startRendering(): void

// Stop rendering
renderer.stopRendering(): void

// Render single frame
renderer.render(): void

// Set render mode
renderer.setRenderMode(mode: RenderMode): void

// Set quality level
renderer.setQuality(quality: QualityLevel): void

// Enable/disable post-processing
renderer.setPostProcessing(enabled: boolean): void
```

**Render Modes:**

```typescript
type RenderMode =
  | 'wireframe'   // Wireframe only
  | 'shaded'      // Flat shading
  | 'smooth'      // Smooth shading with normals
  | 'textured'    // With textures
  | 'xray'        // Semi-transparent
  | 'realistic';  // PBR with lighting

type QualityLevel =
  | 'low'         // 0.5x resolution, no AA, no shadows
  | 'medium'      // 1.0x resolution, FXAA, soft shadows
  | 'high'        // 1.5x resolution, MSAA, ray-traced shadows
  | 'ultra';      // 2.0x resolution, TAA, advanced effects
```

##### Selection

```typescript
// Enable selection
renderer.enableSelection(options?: SelectionOptions): void

// Disable selection
renderer.disableSelection(): void

// Get object under cursor
renderer.pick(x: number, y: number): PickResult | null

// Select mesh
renderer.select(meshId: string): void

// Deselect all
renderer.clearSelection(): void

// Highlight mesh
renderer.highlight(meshId: string, color?: string): void
```

**Selection Types:**

```typescript
interface SelectionOptions {
  highlightColor?: string;    // Default: '#FFD700'
  outlineWidth?: number;      // Default: 2
  onSelect?: (meshId: string) => void;
  onDeselect?: () => void;
}

interface PickResult {
  meshId: string;
  point: [number, number, number];
  normal: [number, number, number];
  faceIndex: number;
  distance: number;
}
```

##### Screenshot & Export

```typescript
// Capture screenshot
renderer.screenshot(options?: ScreenshotOptions): Promise<Blob>

// Export to data URL
renderer.toDataURL(format?: 'png' | 'jpeg', quality?: number): string

// Record video (experimental)
renderer.startRecording(): void
renderer.stopRecording(): Promise<Blob>
```

##### Events

```typescript
// Camera changed
renderer.on('camera-change', (camera: CameraState) => void)

// Selection changed
renderer.on('selection-change', (meshId: string | null) => void)

// Render frame
renderer.on('render', (frameTime: number) => void)

// Error occurred
renderer.on('error', (error: Error) => void)
```

### Camera Controller

Advanced camera control for viewport navigation.

```typescript
import { CameraController } from '@sim4d/viewport';

const controller = new CameraController(camera, domElement);

// Control modes
controller.setMode('orbit');    // Orbit around target
controller.setMode('pan');      // Pan in screen space
controller.setMode('fly');      // Free-form flight

// Constraints
controller.minDistance = 1;
controller.maxDistance = 1000;
controller.minPolarAngle = 0;
controller.maxPolarAngle = Math.PI;

// Damping
controller.enableDamping = true;
controller.dampingFactor = 0.05;

// Update loop
function animate() {
  controller.update();
  renderer.render();
  requestAnimationFrame(animate);
}
```

### Selection Manager

Manage selection state and interactions.

```typescript
import { SelectionManager } from '@sim4d/viewport';

const selectionManager = new SelectionManager(renderer);

// Single selection
selectionManager.select('mesh-1');

// Multi-selection
selectionManager.addToSelection('mesh-2');
selectionManager.removeFromSelection('mesh-1');

// Box selection
selectionManager.boxSelect(
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  addToSelection: true
);

// Get selection
const selected = selectionManager.getSelection();

// Events
selectionManager.on('changed', (selected: string[]) => {
  console.log('Selection changed:', selected);
});
```

## React Components

### Enhanced3DViewport

Main viewport component with built-in controls.

```tsx
import { Enhanced3DViewport } from '@sim4d/viewport';

<Enhanced3DViewport
  geometryData={geometryData}
  renderMode="shaded"
  quality="high"
  showGrid={true}
  showAxes={true}
  backgroundColor="#1a1a1a"
  cameraState={cameraState}
  onCameraChange={handleCameraChange}
  onSelect={handleSelect}
/>
```

**Props:**

```typescript
interface Enhanced3DViewportProps {
  geometryData: GeometryData;
  renderMode?: RenderMode;
  quality?: QualityLevel;
  showGrid?: boolean;
  showAxes?: boolean;
  showStats?: boolean;
  backgroundColor?: string;
  cameraState?: CameraState;
  selectionEnabled?: boolean;
  onCameraChange?: (camera: CameraState) => void;
  onSelect?: (meshId: string | null) => void;
  onError?: (error: Error) => void;
}
```

### ViewportLayoutManager

Multi-viewport layout system.

```tsx
import { ViewportLayoutManager } from '@sim4d/viewport';

<ViewportLayoutManager
  initialLayout="quad"
  enableKeyboardShortcuts={true}
  showLayoutControls={true}
  geometryData={geometryData}
  onLayoutChange={handleLayoutChange}
  onViewportSelect={handleViewportSelect}
  onCameraChange={handleCameraChange}
/>
```

**Props:**

```typescript
interface ViewportLayoutManagerProps {
  initialLayout?: 'single' | 'quad' | 'horizontal' | 'vertical';
  enableKeyboardShortcuts?: boolean;
  showLayoutControls?: boolean;
  geometryData: GeometryData;
  syncCameras?: boolean;
  onLayoutChange?: (layout: string) => void;
  onViewportSelect?: (viewportId: string) => void;
  onCameraChange?: (viewportId: string, camera: CameraState) => void;
  onRenderModeChange?: (viewportId: string, mode: RenderMode) => void;
}
```

**Keyboard Shortcuts:**

- `Ctrl+1`: Single viewport
- `Ctrl+2`: Horizontal split
- `Ctrl+3`: Vertical split
- `Ctrl+4`: Quad layout
- `Tab`: Cycle viewports
- `R`: Cycle render modes
- `1-7`: Standard views (Front, Back, Left, Right, Top, Bottom, ISO)
- `F`: Fit to view
- `G`: Toggle grid
- `A`: Toggle axes

## Examples

### Example 1: Basic Mesh Rendering

```typescript
import { ViewportRenderer } from '@sim4d/viewport';

const renderer = new ViewportRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});

// Create a cube
const size = 100;
const vertices = new Float32Array([
  // Front face
  -size, -size, size, size, -size, size, size, size, size, -size, size, size,
  // Back face
  -size, -size, -size, -size, size, -size, size, size, -size, size, -size, -size,
  // ... other faces
]);

const indices = new Uint32Array([
  0, 1, 2, 0, 2, 3, // Front
  4, 5, 6, 4, 6, 7, // Back
  // ... other faces
]);

renderer.addMesh({
  id: 'cube',
  vertices,
  indices,
  color: '#4CAF50',
});

renderer.fitToView();
renderer.startRendering();
```

### Example 2: Interactive Selection

```typescript
import { ViewportRenderer, SelectionManager } from '@sim4d/viewport';

const renderer = new ViewportRenderer({ canvas });
const selection = new SelectionManager(renderer);

// Add click handler
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const result = renderer.pick(x, y);
  if (result) {
    selection.select(result.meshId);
    console.log('Selected:', result.meshId, 'at', result.point);
  } else {
    selection.clearSelection();
  }
});

// Selection changed handler
selection.on('changed', (selected) => {
  updateUI(selected);
});
```

### Example 3: Multi-Viewport Layout

```tsx
import React, { useState } from 'react';
import { ViewportLayoutManager } from '@sim4d/viewport';

export function CADWorkspace() {
  const [layout, setLayout] = useState('single');
  const [geometry, setGeometry] = useState(null);

  return (
    <div className="workspace">
      <div className="toolbar">
        <button onClick={() => setLayout('single')}>Single</button>
        <button onClick={() => setLayout('quad')}>Quad</button>
      </div>

      <ViewportLayoutManager
        initialLayout={layout}
        geometryData={geometry}
        enableKeyboardShortcuts={true}
        showLayoutControls={true}
        onLayoutChange={setLayout}
        onViewportSelect={(id) => console.log('Active viewport:', id)}
        onCameraChange={(id, camera) => {
          console.log('Camera changed in', id, camera);
        }}
      />
    </div>
  );
}
```

### Example 4: Custom Render Pipeline

```typescript
import { ViewportRenderer } from '@sim4d/viewport';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const renderer = new ViewportRenderer({ canvas });

// Get Three.js renderer
const threeRenderer = renderer.getThreeRenderer();
const scene = renderer.getScene();
const camera = renderer.getThreeCamera();

// Setup post-processing
const composer = new EffectComposer(threeRenderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 1.5, 0.4, 0.85));

// Custom render loop
renderer.stopRendering();
function animate() {
  composer.render();
  requestAnimationFrame(animate);
}
animate();
```

## Performance Optimization

### Memory Management

```typescript
// Dispose of meshes when no longer needed
renderer.removeMesh('mesh-1');

// Clear all geometry
renderer.clear();

// Dispose renderer
renderer.dispose();
```

### LOD (Level of Detail)

```typescript
renderer.addMesh({
  id: 'complex-part',
  vertices: highResVertices,
  lod: [
    { distance: 100, vertices: mediumResVertices },
    { distance: 500, vertices: lowResVertices },
  ],
});
```

### Frustum Culling

```typescript
// Automatically enabled
renderer.enableFrustumCulling = true;
```

### Adaptive Quality

```typescript
// Automatically adjust quality based on FPS
renderer.enableAdaptiveQuality({
  targetFPS: 60,
  minQuality: 'low',
  maxQuality: 'high',
});

// Monitor performance
renderer.on('performance', (stats) => {
  console.log(`FPS: ${stats.fps}, Draw calls: ${stats.drawCalls}`);
});
```

## Advanced Features

### Environment Mapping

```typescript
renderer.setEnvironmentMap('path/to/hdr.hdr', {
  intensity: 1.0,
  rotation: 0,
});
```

### Shadows

```typescript
renderer.enableShadows({
  type: 'pcf',         // 'basic' | 'pcf' | 'pcfsoft'
  mapSize: 2048,
  bias: -0.0001,
  normalBias: 0.02,
});
```

### Anti-Aliasing

```typescript
renderer.setAntiAliasing('fxaa'); // 'none' | 'fxaa' | 'smaa' | 'msaa' | 'taa'
```

### Screen Space Ambient Occlusion (SSAO)

```typescript
renderer.enableSSAO({
  kernelRadius: 8,
  minDistance: 0.005,
  maxDistance: 0.1,
});
```

## Browser Compatibility

- **Chrome/Edge**: Full support (WebGL2 + WebGPU)
- **Firefox**: Full support (WebGL2)
- **Safari**: WebGL2 support (iOS 15+)
- **WebGPU**: Experimental (Chrome Canary with flag)

## Performance Targets

- **60 FPS** for meshes with ≤2M triangles
- **120 FPS** for simple scenes (<100K triangles)
- **Memory**: <500MB for typical CAD models
- **Load time**: <1s for 10MB STEP file

## Troubleshooting

### Low FPS

1. Reduce quality level: `renderer.setQuality('low')`
2. Disable shadows: `renderer.enableShadows(false)`
3. Enable frustum culling
4. Use LOD for complex meshes

### WebGL Context Lost

```typescript
renderer.on('context-lost', () => {
  console.warn('WebGL context lost, attempting recovery...');
});

renderer.on('context-restored', () => {
  console.log('WebGL context restored');
  // Reload geometry
});
```

### Black Screen

- Check canvas size is non-zero
- Verify geometry data is valid
- Check camera position/target
- Enable `logarithmicDepthBuffer` for large scenes

## License

MPL-2.0 - See LICENSE in repository root
