# @sim4d/engine-occt

OpenCASCADE Technology (OCCT) WebAssembly bindings for Sim4D - provides exact B-Rep/NURBS geometry operations.

**Status**: ✅ Production Ready (Verified November 14, 2025)  
**WASM Binaries**: 55MB pre-compiled (no build required)  
**Operations Verified**: 25 core OCCT functions tested and working

## Overview

The engine-occt package provides the **production-ready geometry kernel** for Sim4D, wrapping OCCT in WebAssembly for browser-based CAD operations.

**✅ Verified Capabilities** (November 14, 2025):

- 25 OCCT operations fully functional
- Deterministic geometry calculations
- Accurate bounding box and volume calculations
- Production WASM binaries (occt.wasm, occt-core.wasm, occt-core.node.wasm)
- Standalone test verification passing

**Core Features**:

- Exact B-Rep/NURBS geometry representation
- Boolean operations (union, subtract, intersect)
- Filleting, chamfering, shelling, and drafting
- STEP/IGES import and export
- Mesh tessellation for visualization
- Multi-threaded WASM execution with SharedArrayBuffer

## Installation

```bash
pnpm add @sim4d/engine-occt
```

## Architecture

The package uses a three-layer architecture:

1. **GeometryAPI**: High-level TypeScript interface
2. **WorkerClient**: Communication layer for Web Workers
3. **OCCT WASM**: Compiled C++ geometry kernel

## Core Components

### GeometryAPI

Main interface for geometry operations.

```typescript
import { GeometryAPI, createGeometryAPI } from '@sim4d/engine-occt';

// Create API instance
const api = createGeometryAPI(false); // false = use real OCCT, true = use mock
await api.init();

// Basic shapes
const box = await api.invoke('MAKE_BOX', {
  center: { x: 0, y: 0, z: 0 },
  width: 100,
  height: 50,
  depth: 25,
});

const cylinder = await api.invoke('MAKE_CYLINDER', {
  center: { x: 0, y: 0, z: 0 },
  axis: { x: 0, y: 0, z: 1 },
  radius: 25,
  height: 100,
});

const sphere = await api.invoke('MAKE_SPHERE', {
  center: { x: 0, y: 0, z: 0 },
  radius: 50,
});

// Boolean operations
const union = await api.invoke('BOOLEAN_UNION', {
  shapes: [box, cylinder],
});

const difference = await api.invoke('BOOLEAN_SUBTRACT', {
  base: box,
  tools: [cylinder],
});

// Tessellation for display
const meshData = await api.tessellate(box.id, 0.01);
// Returns: { vertices, indices, normals }

// Cleanup
await api.dispose(box.id);
```

### Sketch Operations

2D sketching and profile creation.

```typescript
// Create 2D primitives
const line = await api.invoke('CREATE_LINE', {
  start: { x: 0, y: 0, z: 0 },
  end: { x: 100, y: 0, z: 0 },
});

const circle = await api.invoke('CREATE_CIRCLE', {
  center: { x: 0, y: 0, z: 0 },
  radius: 50,
  normal: { x: 0, y: 0, z: 1 },
});

const arc = await api.invoke('CREATE_ARC', {
  center: { x: 0, y: 0, z: 0 },
  radius: 50,
  startAngle: 0,
  endAngle: Math.PI / 2,
  normal: { x: 0, y: 0, z: 1 },
});

// Create wire from edges
const wire = await api.invoke('MAKE_WIRE', {
  edges: [line, arc],
});

// Create face from wire
const face = await api.invoke('MAKE_FACE', {
  wire: wire,
});
```

### Solid Operations

3D modeling operations.

```typescript
// Extrusion
const extruded = await api.invoke('MAKE_EXTRUDE', {
  profile: face,
  direction: { x: 0, y: 0, z: 1 },
  distance: 100,
});

// Revolution
const revolved = await api.invoke('MAKE_REVOLVE', {
  profile: face,
  axis: { x: 0, y: 1, z: 0 },
  angle: Math.PI * 2,
});

// Sweep
const swept = await api.invoke('MAKE_SWEEP', {
  profile: face,
  path: wire,
});

// Loft
const lofted = await api.invoke('MAKE_LOFT', {
  profiles: [face1, face2, face3],
  ruled: false,
});
```

### Feature Operations

Advanced modeling features.

```typescript
// Fillet
const filleted = await api.invoke('MAKE_FILLET', {
  shape: box,
  edges: edgeIds,
  radius: 5,
});

// Chamfer
const chamfered = await api.invoke('MAKE_CHAMFER', {
  shape: box,
  edges: edgeIds,
  distance: 3,
});

// Shell
const shelled = await api.invoke('MAKE_SHELL', {
  shape: box,
  faces: faceIds,
  thickness: 2,
  tolerance: 0.001,
});

// Draft
const drafted = await api.invoke('MAKE_DRAFT', {
  shape: box,
  faces: faceIds,
  angle: Math.PI / 18, // 10 degrees
  pullingDirection: { x: 0, y: 0, z: 1 },
});
```

### Import/Export

File format support.

```typescript
// Import STEP
const imported = await api.invoke('IMPORT_STEP', {
  data: stepFileContent,
  options: {
    readColors: true,
    readNames: true,
  },
});

// Export STEP
const stepData = await api.invoke('EXPORT_STEP', {
  shapes: [shape1, shape2],
  options: {
    writeColors: true,
    schema: 'AP242',
  },
});

// Import IGES
const igesShape = await api.invoke('IMPORT_IGES', {
  data: igesFileContent,
});

// Export STL
const stlData = await api.invoke('EXPORT_STL', {
  shape: shape,
  options: {
    ascii: false,
    deflection: 0.01,
  },
});
```

### MockGeometry

Development and testing interface that simulates OCCT operations.

```typescript
import { MockGeometry } from '@sim4d/engine-occt';

const mock = new MockGeometry();

// Creates mock shape handles with random IDs
const box = mock.createBox(
  { x: 0, y: 0, z: 0 }, // center
  100,
  50,
  25 // dimensions
);

// Returns mock mesh data
const mesh = await mock.tessellate(box, 0.01);
```

## Worker Architecture

The package uses Web Workers for thread isolation:

```
Main Thread
    ↓
GeometryAPI
    ↓
WorkerClient
    ↓ (postMessage)
Worker Thread
    ↓
OCCT Bindings
    ↓
WASM Module
```

### Worker Communication

```typescript
// Worker client handles message passing
class WorkerClient implements WorkerAPI {
  async invoke(operation: string, params: any): Promise<any> {
    return this.sendMessage({ type: 'invoke', operation, params });
  }

  async tessellate(shapeId: string, deflection: number): Promise<MeshData> {
    return this.sendMessage({ type: 'tessellate', shapeId, deflection });
  }
}
```

## OCCT WASM Binaries

**✅ Pre-compiled binaries are included** - no build step required for standard use.

### Binary Artifacts

Located in `wasm/` directory:

```
occt.wasm (13MB)          - Full threaded web version
occt.js (218KB)           - Web glue code
occt-core.wasm (8.7MB)    - Optimized single-thread version
occt-core.js (150KB)      - Optimized glue code
occt-core.node.wasm (8.3MB) - Node.js version
occt-core.node.mjs (188KB)  - Node.js ES module
```

**Total**: 55MB production-ready binaries (verified November 14, 2025)

### Verification

Run standalone test to verify OCCT functionality:

```bash
cd packages/engine-occt
node test-occt-direct.mjs
```

Expected output shows 25 OCCT operations working correctly.

## Building OCCT WASM (Optional)

**Note**: Pre-compiled binaries are included. Building from source is only needed for custom OCCT configurations.

The OCCT WebAssembly module can be recompiled with Emscripten:

```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Build OCCT
cd packages/engine-occt
bash scripts/build-occt.sh
```

Build configuration:

- **Modules**: TKernel, TKMath, TKG3d, TKGeomBase, TKBRep, TKGeomAlgo, TKTopAlgo, TKPrim, TKBO, TKFillet, TKOffset, TKSTEP, TKIGES, TKMesh
- **Flags**: `-pthread`, `-s ALLOW_MEMORY_GROWTH=1`, `-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']`
- **Optimization**: `-O3` for release builds

## Performance Optimization

### Tessellation Quality

Balance quality vs performance:

```typescript
// High quality (slow)
const highQuality = await api.tessellate(shape.id, 0.001);

// Medium quality (balanced)
const mediumQuality = await api.tessellate(shape.id, 0.01);

// Low quality (fast)
const lowQuality = await api.tessellate(shape.id, 0.1);
```

### Memory Management

```typescript
// Always dispose shapes when done
const shape = await api.invoke('MAKE_BOX', params);
try {
  // Use shape
  const mesh = await api.tessellate(shape.id, 0.01);
  // Process mesh
} finally {
  await api.dispose(shape.id);
}
```

### Worker Pooling

For high-throughput operations:

```typescript
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.workers.push(new Worker('occt-worker.js'));
    }
  }

  async execute(operation: string, params: any): Promise<any> {
    const worker = await this.getAvailableWorker();
    return this.runOnWorker(worker, operation, params);
  }
}
```

## Browser Requirements

- **SharedArrayBuffer**: Required for WASM threads
- **Cross-Origin Isolation**: COOP/COEP headers must be set
- **WebAssembly**: Modern browser with WASM support
- **Memory**: Minimum 2GB recommended for complex operations

## Error Handling

```typescript
try {
  const result = await api.invoke('BOOLEAN_UNION', { shapes });
} catch (error) {
  if (error.code === 'INVALID_TOPOLOGY') {
    // Handle invalid input geometry
  } else if (error.code === 'OPERATION_FAILED') {
    // Handle boolean operation failure
  } else if (error.code === 'OUT_OF_MEMORY') {
    // Handle memory exhaustion
  }
}
```

## Testing

```bash
# Run tests
pnpm test

# Run with mock geometry
MOCK_GEOMETRY=true pnpm test
```

## API Reference

### Types

```typescript
interface ShapeHandle {
  id: string;
  type: 'vertex' | 'edge' | 'wire' | 'face' | 'shell' | 'solid' | 'compound';
  bbox?: BoundingBox;
}

interface MeshData {
  vertices: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface BoundingBox {
  min: Point3D;
  max: Point3D;
}

interface WorkerAPI {
  invoke<T = any>(operation: string, params: any): Promise<T>;
  tessellate(shapeId: string, deflection: number): Promise<MeshData>;
  dispose(handleId: string): Promise<void>;
}
```

## License

MPL-2.0 - See LICENSE in repository root

OCCT is licensed under LGPL-2.1 with exception, dynamically linked via WASM.
