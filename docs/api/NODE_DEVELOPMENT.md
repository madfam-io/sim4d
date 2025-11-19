# Node Development Guide

Complete guide to developing custom nodes for BrepFlow.

## Table of Contents

1. [Node Fundamentals](#node-fundamentals)
2. [Node Structure](#node-structure)
3. [Parameter Types](#parameter-types)
4. [Input/Output Sockets](#inputoutput-sockets)
5. [Evaluation Function](#evaluation-function)
6. [Error Handling](#error-handling)
7. [Testing Nodes](#testing-nodes)
8. [Best Practices](#best-practices)
9. [Advanced Topics](#advanced-topics)

## Node Fundamentals

### What is a Node?

A node in BrepFlow is a reusable computational unit that:
- Takes typed inputs from other nodes
- Has configurable parameters
- Performs geometry operations or calculations
- Produces typed outputs for downstream nodes
- Participates in the evaluation DAG

### Node Lifecycle

```
1. Registration  → Node definition added to registry
2. Instantiation → Node added to graph
3. Configuration → Parameters set by user
4. Evaluation    → Inputs collected, function executed
5. Output        → Results passed to dependent nodes
```

## Node Structure

### Basic Node Definition

```typescript
import { NodeBuilder } from '@brepflow/sdk';

const MyNode = new NodeBuilder('Category::NodeName')
  .name('Display Name')
  .description('What this node does')
  .category('Category')
  .param('paramName', 'type', defaultValue, options)
  .input('inputName', 'Type', 'Description')
  .output('outputName', 'Type', 'Description')
  .evaluate(async (ctx, inputs, params) => {
    // Node logic here
    return { outputName: result };
  })
  .build();
```

### Node ID Convention

Node IDs follow the pattern: `Category::NodeName`

**Examples:**
- `Primitives::Box`
- `Operations::Union`
- `Features::Fillet`
- `Transforms::Move`
- `Custom::MyNode`

**Rules:**
- Use PascalCase for both category and name
- Category groups related nodes
- Name should be descriptive and unique
- No spaces or special characters

## Parameter Types

### Number Parameter

```typescript
.param('radius', 'number', 50, {
  min: 0,           // Minimum value
  max: 1000,        // Maximum value
  step: 1,          // Increment step
  unit: 'mm',       // Display unit
  precision: 2,     // Decimal places
})
```

### String Parameter

```typescript
.param('name', 'string', 'Part', {
  maxLength: 255,
  pattern: '^[A-Za-z0-9_-]+$', // Regex validation
  placeholder: 'Enter name',
})
```

### Boolean Parameter

```typescript
.param('enabled', 'boolean', true)
```

### Select Parameter

```typescript
.param('mode', 'select', 'option1', {
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
})
```

### Vector Parameter

```typescript
.param('direction', 'vector', { x: 0, y: 0, z: 1 }, {
  normalize: true,  // Auto-normalize vector
})
```

### Color Parameter

```typescript
.param('color', 'color', '#4CAF50', {
  alpha: true,  // Support transparency
})
```

### Angle Parameter

```typescript
.param('rotation', 'angle', 0, {
  min: 0,
  max: 360,
  unit: 'degrees', // or 'radians'
})
```

## Input/Output Sockets

### Input Types

```typescript
.input('shape', 'Shape', 'Input shape')
.input('profile', 'Face', 'Profile to extrude')
.input('path', 'Edge', 'Path to follow')
.input('shapes', 'Shape[]', 'Multiple shapes')
.input('number', 'number', 'Numeric value')
.input('text', 'string', 'Text value')
```

### Output Types

```typescript
.output('shape', 'Shape', 'Resulting shape')
.output('shapes', 'Shape[]', 'Array of shapes')
.output('success', 'boolean', 'Operation success')
.output('count', 'number', 'Number of elements')
```

### Common Types

- `Shape` - 3D solid or surface
- `Face` - 2D surface
- `Edge` - 1D curve
- `Vertex` - 0D point
- `Shape[]` - Array of shapes
- `number` - Numeric value
- `string` - Text value
- `boolean` - True/false
- `any` - Untyped value (avoid if possible)

### Optional Inputs

```typescript
.input('reference', 'Shape', 'Reference shape (optional)', {
  optional: true,
  default: null,
})
```

## Evaluation Function

### Function Signature

```typescript
async (ctx: EvalContext, inputs: I, params: P) => Promise<O>
```

**Parameters:**
- `ctx` - Evaluation context with worker API
- `inputs` - Values from input sockets
- `params` - Parameter values
- Returns: Object with output values

### Context API

```typescript
interface EvalContext {
  nodeId: string;           // Current node ID
  worker: WorkerAPI;        // Geometry worker
  cache: Map<string, any>;  // Per-node cache
  abort: AbortController;   // Cancellation signal
}
```

### Worker API Methods

```typescript
// Primitives
await ctx.worker.invoke('MAKE_BOX', { width, height, depth });
await ctx.worker.invoke('MAKE_CYLINDER', { radius, height });
await ctx.worker.invoke('MAKE_SPHERE', { radius });

// Boolean operations
await ctx.worker.invoke('BOOLEAN_UNION', { shapes: [s1, s2] });
await ctx.worker.invoke('BOOLEAN_SUBTRACT', { base, tools: [tool] });
await ctx.worker.invoke('BOOLEAN_INTERSECT', { shapes });

// Features
await ctx.worker.invoke('FILLET_EDGES', { shape, radius });
await ctx.worker.invoke('CHAMFER_EDGES', { shape, distance });

// Transforms
await ctx.worker.invoke('TRANSFORM_TRANSLATE', { shape, x, y, z });
await ctx.worker.invoke('TRANSFORM_ROTATE', { shape, angle, axis });
await ctx.worker.invoke('TRANSFORM_SCALE', { shape, scale });

// Measurements
await ctx.worker.invoke('MEASURE_VOLUME', { shape });
await ctx.worker.invoke('MEASURE_SURFACE_AREA', { shape });
await ctx.worker.invoke('MEASURE_BOUNDING_BOX', { shape });
```

### Basic Example

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { width, height, depth } = params;

  const shape = await ctx.worker.invoke('MAKE_BOX', {
    width,
    height,
    depth,
    centerX: 0,
    centerY: 0,
    centerZ: 0,
  });

  return { shape };
})
```

### With Input Processing

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { shape } = inputs;
  const { radius } = params;

  if (!shape) {
    throw new Error('Input shape is required');
  }

  const filleted = await ctx.worker.invoke('FILLET_EDGES', {
    shape,
    radius,
  });

  return { shape: filleted };
})
```

### Complex Multi-Step

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { profile } = inputs;
  const { distance, angle, taper } = params;

  // Step 1: Extrude profile
  let shape = await ctx.worker.invoke('EXTRUDE', {
    profile,
    distance,
    taper,
  });

  // Step 2: Rotate if needed
  if (angle !== 0) {
    shape = await ctx.worker.invoke('TRANSFORM_ROTATE', {
      shape,
      angle,
      axisX: 0,
      axisY: 0,
      axisZ: 1,
    });
  }

  // Step 3: Measure properties
  const volume = await ctx.worker.invoke('MEASURE_VOLUME', { shape });
  const area = await ctx.worker.invoke('MEASURE_SURFACE_AREA', { shape });

  return {
    shape,
    volume,
    surfaceArea: area,
  };
})
```

## Error Handling

### Input Validation

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { shape } = inputs;
  const { radius, depth } = params;

  // Validate inputs
  if (!shape) {
    throw new Error('Input shape is required');
  }

  // Validate parameters
  if (radius <= 0) {
    throw new Error('Radius must be positive');
  }

  if (depth >= radius) {
    throw new Error('Depth must be less than radius');
  }

  // Continue with operation...
})
```

### Try-Catch for Geometry Operations

```typescript
.evaluate(async (ctx, inputs, params) => {
  try {
    const shape = await ctx.worker.invoke('BOOLEAN_UNION', {
      shapes: inputs.shapes,
    });

    return { shape };
  } catch (error) {
    throw new Error(`Boolean union failed: ${error.message}`);
  }
})
```

### Graceful Degradation

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { shape } = inputs;
  const { filletRadius } = params;

  let result = shape;

  // Try to fillet, but continue if it fails
  if (filletRadius > 0) {
    try {
      result = await ctx.worker.invoke('FILLET_EDGES', {
        shape,
        radius: filletRadius,
      });
    } catch (error) {
      console.warn('Fillet failed, using original shape:', error);
    }
  }

  return { shape: result };
})
```

## Testing Nodes

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { MyCustomNode } from './my-node';

describe('MyCustomNode', () => {
  it('should have correct metadata', () => {
    expect(MyCustomNode.id).toBe('Custom::MyNode');
    expect(MyCustomNode.name).toBe('My Node');
    expect(MyCustomNode.category).toBe('Custom');
  });

  it('should have required parameters', () => {
    expect(MyCustomNode.params.width).toBeDefined();
    expect(MyCustomNode.params.height).toBeDefined();
  });

  it('should validate inputs', async () => {
    const ctx = createMockContext();
    const inputs = {};
    const params = { width: 100, height: 50 };

    await expect(
      MyCustomNode.evaluate(ctx, inputs, params)
    ).rejects.toThrow('Input shape is required');
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { DAGEngine } from '@brepflow/engine-core';
import { MyCustomNode } from './my-node';

describe('MyCustomNode Integration', () => {
  it('should evaluate in graph', async () => {
    const engine = new DAGEngine();

    // Create graph with node
    const graph = {
      nodes: [
        {
          id: 'node1',
          type: 'Custom::MyNode',
          params: { width: 100, height: 50 },
          inputs: {},
        },
      ],
      edges: [],
    };

    // Register node
    engine.registerNode(MyCustomNode);

    // Evaluate
    const result = await engine.evaluate(graph, ['node1']);

    expect(result.node1.shape).toBeDefined();
  });
});
```

### Mock Worker API

```typescript
function createMockWorker(): WorkerAPI {
  return {
    async invoke(operation: string, params: any) {
      if (operation === 'MAKE_BOX') {
        return { type: 'shape', id: 'mock-box' };
      }
      if (operation === 'BOOLEAN_UNION') {
        return { type: 'shape', id: 'mock-union' };
      }
      throw new Error(`Unknown operation: ${operation}`);
    },
  };
}

function createMockContext(): EvalContext {
  return {
    nodeId: 'test-node',
    worker: createMockWorker(),
    cache: new Map(),
    abort: new AbortController(),
  };
}
```

## Best Practices

### 1. Clear Naming

✅ **Good:**
```typescript
.param('holeDiameter', 'number', 10, { min: 1, max: 50, unit: 'mm' })
```

❌ **Bad:**
```typescript
.param('d', 'number', 10)
```

### 2. Sensible Defaults

Choose defaults that work for common use cases:

```typescript
.param('width', 'number', 100)      // Common size
.param('quality', 'number', 0.01)   // Good balance
.param('enabled', 'boolean', true)  // Active by default
```

### 3. Input Validation

Always validate inputs and parameters:

```typescript
.evaluate(async (ctx, inputs, params) => {
  // Check required inputs
  if (!inputs.shape) {
    throw new Error('Input shape is required');
  }

  // Validate parameter ranges
  if (params.count < 1) {
    throw new Error('Count must be at least 1');
  }

  // Validate parameter relationships
  if (params.innerRadius >= params.outerRadius) {
    throw new Error('Inner radius must be less than outer radius');
  }

  // Continue...
})
```

### 4. Descriptive Errors

Provide clear error messages:

```typescript
// ❌ Bad
throw new Error('Invalid input');

// ✅ Good
throw new Error(
  `Fillet radius (${radius}mm) must be less than edge length (${edgeLength}mm)`
);
```

### 5. Performance Optimization

Cache expensive computations:

```typescript
.evaluate(async (ctx, inputs, params) => {
  const cacheKey = `mesh-${JSON.stringify(params)}`;

  if (ctx.cache.has(cacheKey)) {
    return ctx.cache.get(cacheKey);
  }

  const result = await expensiveOperation();

  ctx.cache.set(cacheKey, result);

  return result;
})
```

### 6. Cancellation Support

Check abort signal for long operations:

```typescript
.evaluate(async (ctx, inputs, params) => {
  for (let i = 0; i < params.count; i++) {
    // Check if evaluation was cancelled
    if (ctx.abort.signal.aborted) {
      throw new Error('Evaluation cancelled');
    }

    await processItem(i);
  }
})
```

## Advanced Topics

### Conditional Outputs

```typescript
.output('shape', 'Shape')
.output('shapes', 'Shape[]')
.output('error', 'string')

.evaluate(async (ctx, inputs, params) => {
  const { merge } = params;

  try {
    const shapes = await createShapes();

    if (merge) {
      const merged = await mergeShapes(shapes);
      return { shape: merged };
    } else {
      return { shapes };
    }
  } catch (error) {
    return { error: error.message };
  }
})
```

### Dynamic Parameter Ranges

```typescript
.param('innerRadius', 'number', 10, {
  min: 0,
  max: (params) => params.outerRadius * 0.9, // Dynamic max
})
```

### Progress Reporting

```typescript
.evaluate(async (ctx, inputs, params) => {
  const total = params.count;

  for (let i = 0; i < total; i++) {
    const progress = (i + 1) / total;

    // Report progress
    ctx.worker.reportProgress?.(progress, `Processing ${i + 1}/${total}`);

    await processItem(i);
  }

  return { result };
})
```

### Geometry Analysis

```typescript
.evaluate(async (ctx, inputs, params) => {
  const { shape } = inputs;

  // Analyze shape properties
  const volume = await ctx.worker.invoke('MEASURE_VOLUME', { shape });
  const area = await ctx.worker.invoke('MEASURE_SURFACE_AREA', { shape });
  const bbox = await ctx.worker.invoke('MEASURE_BOUNDING_BOX', { shape });

  const valid = await ctx.worker.invoke('VALIDATE_SHAPE', { shape });

  return {
    shape,
    volume,
    surfaceArea: area,
    boundingBox: bbox,
    isValid: valid,
  };
})
```

### Array Operations

```typescript
.input('shapes', 'Shape[]', 'Input shapes')
.output('shape', 'Shape', 'Combined shape')

.evaluate(async (ctx, inputs, params) => {
  const { shapes } = inputs;

  if (!shapes || shapes.length === 0) {
    throw new Error('At least one shape is required');
  }

  // Process array of shapes
  const processed = await Promise.all(
    shapes.map(async (shape) => {
      return await ctx.worker.invoke('TRANSFORM_SCALE', {
        shape,
        scale: params.scale,
      });
    })
  );

  // Merge all shapes
  const result = await ctx.worker.invoke('BOOLEAN_UNION', {
    shapes: processed,
  });

  return { shape: result };
})
```

## Node Categories

Organize nodes into logical categories:

- **Primitives** - Basic shapes (Box, Cylinder, Sphere, etc.)
- **Sketch** - 2D geometry (Line, Circle, Rectangle, etc.)
- **Operations** - Boolean operations (Union, Subtract, Intersect)
- **Features** - Modeling features (Fillet, Chamfer, Shell, Draft)
- **Transforms** - Spatial transformations (Move, Rotate, Scale, Mirror)
- **Patterns** - Arrays and patterns (Linear, Circular, Grid)
- **Measurements** - Analysis (Volume, Area, Distance, Angle)
- **IO** - Import/Export (STEP, IGES, STL, etc.)
- **Utilities** - Helper nodes (Math, Logic, Data)
- **Custom** - User-defined nodes

## Resources

- [SDK Tutorial](./SDK_TUTORIAL.md)
- [API Reference](./API_OVERVIEW.md)
- [Example Nodes](../../packages/nodes-core/src/)
- [BrepFlow Documentation](../../docs/README.md)

## Next Steps

1. Study existing nodes in `@brepflow/nodes-core`
2. Create simple nodes first
3. Add complexity gradually
4. Write tests for your nodes
5. Share with the community!

## Support

- [GitHub Issues](https://github.com/aureolabs/brepflow/issues)
- [Discord Community](https://discord.gg/brepflow)
- [Documentation](https://docs.brepflow.com)
