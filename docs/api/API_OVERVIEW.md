# Sim4D API Documentation

## Overview

Sim4D provides a comprehensive API for building parametric CAD applications with exact B-Rep/NURBS geometry. The API is organized into several packages, each focused on specific functionality.

## Core Packages

### @sim4d/engine-core

The core DAG evaluation engine with dirty propagation, memoization, and graph management.

**Key Exports:**
- `DAGEngine` - Directed acyclic graph evaluation engine
- `GraphManager` - Graph lifecycle and persistence
- `NodeRegistry` - Node type registration and discovery
- `ComputeCache` - Content-addressed result caching
- `PerformanceMonitor` - Performance tracking and metrics
- `PerformanceReporter` - Performance reporting and alerting

**Example:**
```typescript
import { DAGEngine, GraphManager } from '@sim4d/engine-core';

const engine = new DAGEngine();
const manager = new GraphManager(engine);

// Load and evaluate a graph
const graph = await manager.loadGraph('path/to/graph.bflow.json');
await engine.evaluateNode(nodeId);
```

### @sim4d/engine-occt

WebAssembly bindings to OCCT (Open CASCADE Technology) geometry kernel.

**Key Exports:**
- `GeometryAPIFactory` - Factory for creating geometry API instances
- `OCCTWrapper` - Low-level OCCT bindings
- `WorkerPool` - Worker thread pool for parallel geometry operations

**Example:**
```typescript
import { GeometryAPIFactory } from '@sim4d/engine-occt';

const geometryAPI = await GeometryAPIFactory.getAPI();
const boxHandle = await geometryAPI.invoke('MAKE_BOX', {
  width: 100,
  height: 50,
  depth: 30
});
```

### @sim4d/nodes-core

Built-in node library with 30+ geometry nodes.

**Key Exports:**
- `registerCoreNodes()` - Register all built-in nodes
- Individual node implementations (Box, Cylinder, Boolean, Fillet, etc.)

**Example:**
```typescript
import { registerCoreNodes } from '@sim4d/nodes-core';

// Register all core nodes
registerCoreNodes();

// Now you can use nodes like 'Primitives::Box', 'Operations::Union', etc.
```

### @sim4d/sdk

Public SDK for creating custom nodes and plugins.

**Key Exports:**
- `registerNode()` - Register custom node types
- `NodeBuilder` - Fluent API for node definition
- Parameter types: `NumberParam`, `StringParam`, `BooleanParam`, etc.

**Example:**
```typescript
import { registerNode, NumberParam } from '@sim4d/sdk';

registerNode({
  type: 'Custom::MyNode',
  params: {
    length: NumberParam({ min: 0, max: 1000, default: 100 }),
  },
  inputs: {
    shape: 'Shape',
  },
  outputs: {
    result: 'Shape',
  },
  evaluate: async (ctx, inputs, params) => {
    // Your node logic here
    return { result: await ctx.geom.invoke('TRANSFORM', {
      shape: inputs.shape,
      scale: params.length / 100
    })};
  },
});
```

### @sim4d/viewport

Three.js-based WebGL2/WebGPU renderer for 3D visualization.

**Key Exports:**
- `ViewportRenderer` - Main renderer class
- `CameraController` - Camera manipulation
- `SelectionManager` - 3D selection and picking

**Example:**
```typescript
import { ViewportRenderer } from '@sim4d/viewport';

const renderer = new ViewportRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
  shadows: true,
});

// Add geometry
renderer.addMesh(meshData);
renderer.render();
```

### @sim4d/cli

Command-line interface for headless rendering and batch processing.

**Commands:**
- `render` - Render a graph and export to STEP/STL/OBJ
- `validate` - Validate a graph file
- `info` - Display graph information

**Example:**
```bash
# Render a graph with parameter overrides
sim4d render enclosure.bflow.json \
  --set L=120 --set W=80 --set H=35 \
  --export step,stl \
  --out ./output/
```

### @sim4d/constraint-solver

2D/3D parametric constraint solving.

**Key Exports:**
- `Solver2D` - 2D constraint solver using Newton-Raphson
- Constraint types: distance, horizontal, vertical, coincident, fixed

**Example:**
```typescript
import { Solver2D } from '@sim4d/constraint-solver';

const solver = new Solver2D();
solver.addConstraint({
  type: 'distance',
  entities: [point1, point2],
  targetValue: 100,
});

const result = solver.solve();
console.log('Converged:', result.success);
```

## Performance Monitoring

Sim4D includes comprehensive performance monitoring capabilities:

```typescript
import {
  PerformanceMonitor,
  PerformanceReporter,
  ConsolePerformanceExporter
} from '@sim4d/engine-core';

// Monitor individual operations
const monitor = new PerformanceMonitor();
const endMeasure = monitor.startMeasure('evaluation');
// ... perform operation ...
endMeasure();

// Set up automatic reporting
const reporter = new PerformanceReporter(60000, [
  new ConsolePerformanceExporter()
]);

monitor.addListener((metrics) => {
  reporter.recordMetrics(metrics);
});

reporter.startAutoExport();
```

## Type Safety

Sim4D is written in TypeScript and provides full type definitions for all APIs. Enable strict mode for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@sim4d/*": ["node_modules/@sim4d/*/src"]
    }
  }
}
```

## Error Handling

All async operations return Promises and throw typed errors:

```typescript
import { GeometryEvaluationError } from '@sim4d/engine-core';

try {
  await engine.evaluateNode(nodeId);
} catch (error) {
  if (error instanceof GeometryEvaluationError) {
    console.error('Geometry error:', error.code, error.message);
  }
}
```

## Next Steps

- [Node Development Guide](./NODE_DEVELOPMENT.md)
- [Plugin Development](./PLUGIN_DEVELOPMENT.md)
- [CLI Reference](./CLI_REFERENCE.md)
- [Examples](../../packages/examples/README.md)
