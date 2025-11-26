# @sim4d/nodes-core

Built-in node library for Sim4D - comprehensive set of parametric CAD operations.

## Overview

The nodes-core package provides the standard node library for Sim4D, including:

- **Sketch nodes**: 2D primitives and curves
- **Solid nodes**: 3D primitives and operations
- **Boolean nodes**: Union, subtract, intersect operations
- **Feature nodes**: Fillet, chamfer, shell, draft
- **Transform nodes**: Move, rotate, scale, mirror, array
- **I/O nodes**: Import/export STEP, IGES, STL

## Installation

```bash
pnpm add @sim4d/nodes-core
```

## Node Categories

### Sketch Nodes

2D geometry creation for profiles and paths.

#### Line

```typescript
{
  type: 'Sketch::Line',
  params: {
    startX: 0,
    startY: 0,
    startZ: 0,
    endX: 100,
    endY: 0,
    endZ: 0
  },
  outputs: {
    edge: 'Edge'
  }
}
```

#### Circle

```typescript
{
  type: 'Sketch::Circle',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius: 50,
    normalX: 0,
    normalY: 0,
    normalZ: 1
  },
  outputs: {
    edge: 'Edge'
  }
}
```

#### Arc

```typescript
{
  type: 'Sketch::Arc',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius: 50,
    startAngle: 0,
    endAngle: 90, // degrees
    normalX: 0,
    normalY: 0,
    normalZ: 1
  },
  outputs: {
    edge: 'Edge'
  }
}
```

#### Rectangle

```typescript
{
  type: 'Sketch::Rectangle',
  params: {
    centerX: 0,
    centerY: 0,
    width: 100,
    height: 50
  },
  outputs: {
    face: 'Face'
  }
}
```

#### Polygon

```typescript
{
  type: 'Sketch::Polygon',
  params: {
    centerX: 0,
    centerY: 0,
    radius: 50,
    sides: 6
  },
  outputs: {
    face: 'Face'
  }
}
```

### Solid Nodes

3D primitive creation and solid operations.

#### Box

```typescript
{
  type: 'Solid::Box',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    width: 100,
    height: 50,
    depth: 25
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Cylinder

```typescript
{
  type: 'Solid::Cylinder',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius: 25,
    height: 100,
    axisX: 0,
    axisY: 0,
    axisZ: 1
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Sphere

```typescript
{
  type: 'Solid::Sphere',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius: 50
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Cone

```typescript
{
  type: 'Solid::Cone',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius1: 50,
    radius2: 25,
    height: 100,
    axisX: 0,
    axisY: 0,
    axisZ: 1
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Torus

```typescript
{
  type: 'Solid::Torus',
  params: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    majorRadius: 50,
    minorRadius: 10,
    axisX: 0,
    axisY: 0,
    axisZ: 1
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Extrude

```typescript
{
  type: 'Solid::Extrude',
  inputs: {
    profile: 'Face'
  },
  params: {
    distance: 100,
    directionX: 0,
    directionY: 0,
    directionZ: 1,
    taper: 0 // degrees
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Revolve

```typescript
{
  type: 'Solid::Revolve',
  inputs: {
    profile: 'Face'
  },
  params: {
    angle: 360, // degrees
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    originX: 0,
    originY: 0,
    originZ: 0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Sweep

```typescript
{
  type: 'Solid::Sweep',
  inputs: {
    profile: 'Face',
    path: 'Edge'
  },
  params: {
    twist: 0, // degrees
    scale: 1.0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Loft

```typescript
{
  type: 'Solid::Loft',
  inputs: {
    profiles: 'Face[]' // Multiple faces
  },
  params: {
    ruled: false,
    solid: true
  },
  outputs: {
    shape: 'Shape'
  }
}
```

### Boolean Nodes

Boolean operations for combining and modifying shapes.

#### Union

```typescript
{
  type: 'Boolean::Union',
  inputs: {
    shapes: 'Shape[]' // Multiple shapes
  },
  params: {
    keepOriginals: false
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Subtract

```typescript
{
  type: 'Boolean::Subtract',
  inputs: {
    base: 'Shape',
    tools: 'Shape[]'
  },
  params: {
    keepOriginals: false
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Intersect

```typescript
{
  type: 'Boolean::Intersect',
  inputs: {
    shapes: 'Shape[]'
  },
  params: {
    keepOriginals: false
  },
  outputs: {
    shape: 'Shape'
  }
}
```

### Feature Nodes

Advanced modeling features for refining geometry.

#### Fillet

```typescript
{
  type: 'Features::Fillet',
  inputs: {
    shape: 'Shape',
    edges: 'Edge[]' // Optional, fillets all if not provided
  },
  params: {
    radius: 5,
    variable: false
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Chamfer

```typescript
{
  type: 'Features::Chamfer',
  inputs: {
    shape: 'Shape',
    edges: 'Edge[]'
  },
  params: {
    distance: 3,
    angle: 45 // degrees
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Shell

```typescript
{
  type: 'Features::Shell',
  inputs: {
    shape: 'Shape',
    faces: 'Face[]' // Faces to remove
  },
  params: {
    thickness: 2,
    tolerance: 0.001,
    offsetMode: 'skin' // 'skin' | 'pipe' | 'recto-verso'
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Draft

```typescript
{
  type: 'Features::Draft',
  inputs: {
    shape: 'Shape',
    faces: 'Face[]'
  },
  params: {
    angle: 5, // degrees
    pullingDirectionX: 0,
    pullingDirectionY: 0,
    pullingDirectionZ: 1,
    neutralPlane: null
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Thickness

```typescript
{
  type: 'Features::Thickness',
  inputs: {
    shape: 'Shape',
    faces: 'Face[]'
  },
  params: {
    offset: 2,
    tolerance: 0.001
  },
  outputs: {
    shape: 'Shape'
  }
}
```

### Transform Nodes

Spatial transformations and patterns.

#### Move

```typescript
{
  type: 'Transform::Move',
  inputs: {
    shape: 'Shape'
  },
  params: {
    x: 100,
    y: 0,
    z: 0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Rotate

```typescript
{
  type: 'Transform::Rotate',
  inputs: {
    shape: 'Shape'
  },
  params: {
    angle: 45, // degrees
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    centerX: 0,
    centerY: 0,
    centerZ: 0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Scale

```typescript
{
  type: 'Transform::Scale',
  inputs: {
    shape: 'Shape'
  },
  params: {
    scaleX: 2,
    scaleY: 2,
    scaleZ: 2,
    uniform: true,
    centerX: 0,
    centerY: 0,
    centerZ: 0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### Mirror

```typescript
{
  type: 'Transform::Mirror',
  inputs: {
    shape: 'Shape'
  },
  params: {
    planeOriginX: 0,
    planeOriginY: 0,
    planeOriginZ: 0,
    planeNormalX: 1,
    planeNormalY: 0,
    planeNormalZ: 0
  },
  outputs: {
    shape: 'Shape'
  }
}
```

#### LinearArray

```typescript
{
  type: 'Transform::LinearArray',
  inputs: {
    shape: 'Shape'
  },
  params: {
    count: 5,
    spacingX: 100,
    spacingY: 0,
    spacingZ: 0,
    merge: false
  },
  outputs: {
    shapes: 'Shape[]'
  }
}
```

#### CircularArray

```typescript
{
  type: 'Transform::CircularArray',
  inputs: {
    shape: 'Shape'
  },
  params: {
    count: 8,
    angle: 360, // degrees
    axisX: 0,
    axisY: 0,
    axisZ: 1,
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    rotate: true,
    merge: false
  },
  outputs: {
    shapes: 'Shape[]'
  }
}
```

### I/O Nodes

Import and export operations for file formats.

#### ImportSTEP

```typescript
{
  type: 'IO::ImportSTEP',
  params: {
    file: 'path/to/file.step',
    readColors: true,
    readNames: true,
    readLayers: true
  },
  outputs: {
    shapes: 'Shape[]'
  }
}
```

#### ExportSTEP

```typescript
{
  type: 'IO::ExportSTEP',
  inputs: {
    shapes: 'Shape[]'
  },
  params: {
    file: 'output.step',
    schema: 'AP242', // 'AP203' | 'AP214' | 'AP242'
    writeColors: true,
    writeNames: true
  },
  outputs: {
    success: 'boolean'
  }
}
```

#### ImportIGES

```typescript
{
  type: 'IO::ImportIGES',
  params: {
    file: 'path/to/file.iges',
    readColors: true,
    readLayers: true
  },
  outputs: {
    shapes: 'Shape[]'
  }
}
```

#### ExportSTL

```typescript
{
  type: 'IO::ExportSTL',
  inputs: {
    shape: 'Shape'
  },
  params: {
    file: 'output.stl',
    ascii: false,
    deflection: 0.01,
    angularDeflection: 0.5
  },
  outputs: {
    success: 'boolean'
  }
}
```

## Custom Node Development

Create custom nodes by extending the base node types:

```typescript
import { registerNode, NumberParam, StringParam } from '@sim4d/nodes-core';

registerNode({
  type: 'Custom::MyNode',
  category: 'Custom',
  description: 'My custom node',
  params: {
    value: NumberParam({
      default: 100,
      min: 0,
      max: 1000,
      step: 10,
    }),
    name: StringParam({
      default: 'MyShape',
    }),
  },
  inputs: {
    input: 'Shape',
  },
  outputs: {
    output: 'Shape',
  },
  evaluate: async (ctx, inputs, params) => {
    // Your custom logic here
    const modified = await ctx.worker.invoke('CUSTOM_OP', {
      shape: inputs.input,
      value: params.value,
    });

    return {
      output: modified,
    };
  },
});
```

## Parameter Types

### NumberParam

```typescript
NumberParam({
  default: 0,
  min: -Infinity,
  max: Infinity,
  step: 1,
  unit: 'mm',
});
```

### StringParam

```typescript
StringParam({
  default: '',
  maxLength: 255,
  pattern: '^[A-Za-z0-9]+$',
});
```

### BooleanParam

```typescript
BooleanParam({
  default: false,
});
```

### SelectParam

```typescript
SelectParam({
  default: 'option1',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ],
});
```

### VectorParam

```typescript
VectorParam({
  default: { x: 0, y: 0, z: 1 },
  normalize: true,
});
```

### ColorParam

```typescript
ColorParam({
  default: '#ff0000',
  alpha: true,
});
```

## Node Registration

All nodes are automatically registered when the package is imported:

```typescript
import '@sim4d/nodes-core';

// Nodes are now available in the registry
const registry = NodeRegistry.getInstance();
const boxNode = registry.getNode('Solid::Box');
```

## Testing Nodes

```typescript
import { testNode } from '@sim4d/nodes-core/test-utils';

describe('Custom::MyNode', () => {
  it('should process input correctly', async () => {
    const result = await testNode('Custom::MyNode', {
      inputs: { input: mockShape },
      params: { value: 100 },
    });

    expect(result.output).toBeDefined();
    expect(result.output.type).toBe('Shape');
  });
});
```

## License

MPL-2.0 - See LICENSE in repository root
