# BrepFlow Studio

Interactive web-based parametric CAD application with node-based visual programming.

> Studio now talks to the real OCCT.wasm backend. Ensure you run `pnpm run build:wasm` before starting the dev server.

## Overview

BrepFlow Studio is the main user interface for BrepFlow, providing:

- **Node Editor**: Visual programming canvas with drag-and-drop interface
- **3D Viewport**: Real-time geometry visualization with Three.js
- **Inspector Panel**: Parameter editing and node configuration
- **Console Output**: Execution feedback and debugging
- **File Management**: Import/export .bflow.json graphs
- **Real-time Evaluation**: Live updates as you edit

## Features

### Node Editor

- **Visual Canvas**: React Flow-based node editor
- **Node Palette**: Searchable library of CAD operations
- **Drag & Drop**: Intuitive node placement and connection
- **Multi-selection**: Select and manipulate multiple nodes
- **Undo/Redo**: Full command history with 100-step memory
- **Copy/Paste**: Duplicate node subgraphs
- **Groups**: Organize nodes with collapsible groups

### 3D Viewport

- **Real-time Rendering**: Immediate visual feedback
- **Camera Controls**: Orbit, pan, zoom navigation
- **Selection Sync**: Visual selection matches node selection
- **Mesh Quality**: Adjustable tessellation quality
- **Display Modes**: Wireframe, shaded, edges
- **Section Planes**: Cross-section visualization
- **Measurement Tools**: Distance and angle measurement

### Parameter Editing

- **Inspector Panel**: Context-sensitive parameter editor
- **Type-specific Controls**: Sliders, inputs, dropdowns
- **Units Support**: mm, cm, m, in, ft
- **Validation**: Real-time parameter validation
- **Expressions**: Formula-based parameter values
- **Presets**: Save and load parameter sets

### File Operations

- **Save/Load**: Local .bflow.json file handling
- **Import**: STEP, IGES file import
- **Export**: STEP, STL, OBJ export
- **Auto-save**: Automatic draft saving
- **Version History**: Track file revisions

## Getting Started

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open in browser
open http://localhost:5173
```

### First Model

1. **Add a Box**: Drag "Solid::Box" from the node palette
2. **Set Parameters**: Select the box and edit width/height/depth in inspector
3. **Add Fillet**: Drag "Features::Fillet" and connect box output to fillet input
4. **Adjust Radius**: Set fillet radius to 5mm
5. **View Result**: The 3D viewport renders real OCCT tessellation
6. **Export**: File > Export > STEP/IGES/STL now produces genuine OCCT output

## User Interface

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar                                                 │
├──────────────┬─────────────────────────┬────────────────┤
│              │                         │                │
│ Node Palette │     Node Editor         │   Inspector    │
│              │     Canvas              │   Panel        │
│              │                         │                │
├──────────────┼─────────────────────────┼────────────────┤
│              │                         │                │
│ Console      │     3D Viewport         │   Properties   │
│ Output       │                         │   Panel        │
│              │                         │                │
└──────────────┴─────────────────────────┴────────────────┘
```

### Toolbar Actions

- **File**: New, Open, Save, Import, Export
- **Edit**: Undo, Redo, Copy, Paste, Delete
- **View**: Zoom fit, Reset camera, Toggle panels
- **Tools**: Measure, Section plane, Settings

### Keyboard Shortcuts

| Action       | Shortcut                  |
| ------------ | ------------------------- |
| New Graph    | `Ctrl+N`                  |
| Open File    | `Ctrl+O`                  |
| Save File    | `Ctrl+S`                  |
| Undo         | `Ctrl+Z`                  |
| Redo         | `Ctrl+Y` / `Ctrl+Shift+Z` |
| Copy         | `Ctrl+C`                  |
| Paste        | `Ctrl+V`                  |
| Delete       | `Del`                     |
| Select All   | `Ctrl+A`                  |
| Zoom Fit     | `F`                       |
| Reset Camera | `Home`                    |

### Node Palette

Organized by category:

- **Sketch**: 2D primitives (Line, Circle, Arc, Rectangle)
- **Solid**: 3D primitives (Box, Cylinder, Sphere, Cone)
- **Boolean**: Operations (Union, Subtract, Intersect)
- **Features**: Modeling (Fillet, Chamfer, Shell, Draft)
- **Transform**: Positioning (Move, Rotate, Scale, Array)
- **I/O**: File operations (Import, Export)

### Inspector Panel

Context-sensitive parameter editing:

- **Numeric**: Sliders and input fields with units
- **Boolean**: Checkboxes for on/off options
- **Select**: Dropdowns for predefined choices
- **Vector**: 3D coordinate inputs
- **Color**: Color picker for materials

## Architecture

### Component Structure

```
src/
├── components/
│   ├── nodes/          # Node implementations
│   ├── panels/         # UI panels (Inspector, Console, etc.)
│   ├── canvas/         # Node editor canvas
│   ├── viewport/       # 3D viewport
│   └── common/         # Shared components
├── store/
│   ├── graph-store.ts  # Graph state management
│   ├── ui-store.ts     # UI state management
│   └── history-store.ts # Undo/redo state
├── hooks/
│   ├── useNodes.ts     # Node management
│   ├── useViewport.ts  # 3D viewport
│   └── useKeyboard.ts  # Keyboard shortcuts
└── utils/
    ├── graph.ts        # Graph utilities
    ├── geometry.ts     # Geometry helpers
    └── export.ts       # File export
```

### State Management

Uses Zustand for state management:

```typescript
// Graph Store
const useGraphStore = create<GraphState>((set, get) => ({
  graph: emptyGraph,
  selectedNodes: [],
  hoveredNode: null,

  addNode: (nodeData) => {
    // Add node with undo/redo support
  },

  updateNode: (nodeId, updates) => {
    // Update node parameters
  },

  // ... other actions
}));

// UI Store
const useUIStore = create<UIState>((set) => ({
  panels: {
    inspector: true,
    console: true,
    palette: true,
  },

  viewport: {
    camera: defaultCamera,
    controls: defaultControls,
  },

  // ... UI state
}));
```

### Real-time Evaluation

The graph evaluates automatically when changes occur:

```typescript
// Auto-evaluation on graph changes
useEffect(() => {
  const unsubscribe = useGraphStore.subscribe(
    (state) => state.graph,
    async (graph) => {
      if (graph.isDirty) {
        await evaluateGraph(graph);
      }
    }
  );

  return unsubscribe;
}, []);
```

## Advanced Features

### Custom Nodes

Create custom node types:

```typescript
// Custom node definition
const CustomBoxNode: NodeDefinition = {
  type: 'Custom::Box',
  category: 'Custom',
  description: 'Custom box with rounded corners',

  params: {
    width: NumberParam({ default: 100, min: 1 }),
    height: NumberParam({ default: 50, min: 1 }),
    depth: NumberParam({ default: 25, min: 1 }),
    cornerRadius: NumberParam({ default: 5, min: 0 }),
  },

  outputs: {
    shape: 'Shape',
  },

  evaluate: async (ctx, inputs, params) => {
    // Create box
    const box = await ctx.worker.invoke('MAKE_BOX', {
      width: params.width,
      height: params.height,
      depth: params.depth,
    });

    // Add fillets if radius > 0
    if (params.cornerRadius > 0) {
      const filleted = await ctx.worker.invoke('MAKE_FILLET', {
        shape: box,
        radius: params.cornerRadius,
      });
      return { shape: filleted };
    }

    return { shape: box };
  },
};

// Register custom node
registerNode(CustomBoxNode);
```

### Plugins

Extend functionality with plugins:

```typescript
// Plugin interface
interface StudioPlugin {
  name: string;
  version: string;

  activate(api: StudioAPI): void;
  deactivate(): void;
}

// Example plugin
class MeasurementPlugin implements StudioPlugin {
  name = 'Measurement Tools';
  version = '1.0.0';

  activate(api: StudioAPI) {
    // Add measurement tools to viewport
    api.viewport.addTool('measure-distance', DistanceTool);
    api.viewport.addTool('measure-angle', AngleTool);

    // Add UI panels
    api.ui.addPanel('measurements', MeasurementPanel);
  }

  deactivate() {
    // Cleanup
  }
}
```

### Expressions

Use expressions for dynamic parameters:

```typescript
// Parameter expressions
const nodeParams = {
  width: 100,
  height: 'width * 0.6', // Expression
  depth: 'width / 4', // Expression
  radius: 'min(width, height) * 0.1',
};

// Expression evaluation
const evaluateExpression = (expr: string, context: Record<string, number>) => {
  return new Function(...Object.keys(context), `return ${expr}`)(...Object.values(context));
};
```

### Themes

Customize the interface appearance:

```typescript
// Theme definition
const darkTheme: Theme = {
  colors: {
    background: '#1e1e1e',
    surface: '#2d2d2d',
    primary: '#007acc',
    text: '#ffffff',
    border: '#404040',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  typography: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
    },
  },
};

// Apply theme
useTheme(darkTheme);
```

## Performance Optimization

### Viewport Performance

```typescript
// LOD (Level of Detail) for large models
const MeshComponent = ({ shape, distance }) => {
  const quality = useMemo(() => {
    if (distance < 100) return 0.001;      // High quality
    if (distance < 500) return 0.01;       // Medium quality
    return 0.1;                            // Low quality
  }, [distance]);

  const mesh = useMemo(() =>
    tessellate(shape, quality),
    [shape, quality]
  );

  return <Mesh geometry={mesh} />;
};
```

### Graph Evaluation

```typescript
// Incremental evaluation
const evaluateGraph = async (graph: Graph, changedNodes: Set<string>) => {
  const affectedNodes = findAffectedNodes(graph, changedNodes);

  // Only evaluate dirty nodes
  for (const nodeId of affectedNodes) {
    await evaluateNode(graph, nodeId);
  }
};
```

### Memory Management

```typescript
// Dispose unused geometries
const disposeGeometry = (shape: ShapeHandle) => {
  if (shape.meshCache) {
    shape.meshCache.dispose();
  }

  worker.invoke('DISPOSE_SHAPE', { id: shape.id });
};

// LRU cache for shapes
const shapeCache = new LRUCache<string, ShapeHandle>({
  max: 100,
  dispose: disposeGeometry,
});
```

## Testing

### Component Testing

```typescript
// Node component test
describe('BoxNode', () => {
  it('should render with parameters', () => {
    render(
      <BoxNode
        data={{
          params: { width: 100, height: 50, depth: 25 }
        }}
      />
    );

    expect(screen.getByText('Box')).toBeInTheDocument();
  });

  it('should update parameters', () => {
    const onUpdate = vi.fn();
    render(<BoxNode data={{ params: {} }} onUpdate={onUpdate} />);

    fireEvent.change(screen.getByLabelText('Width'), {
      target: { value: '150' }
    });

    expect(onUpdate).toHaveBeenCalledWith({
      params: { width: 150 }
    });
  });
});
```

### E2E Testing

```typescript
// Playwright E2E test
test('should create and export model', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Add box node
  await page.click('[data-testid="node-palette"]');
  await page.click('[data-testid="solid-box"]');

  // Set parameters
  await page.fill('[data-testid="width-input"]', '100');
  await page.fill('[data-testid="height-input"]', '50');

  // Export model
  await page.click('[data-testid="file-menu"]');
  await page.click('[data-testid="export-step"]');

  // Verify download
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.step');
});
```

## Deployment

### Development Build

```bash
# Development server with hot reload
pnpm run dev

# Build for development
pnpm run build:dev
```

### Production Build

```bash
# Production build
pnpm run build

# Preview production build
pnpm run preview

# Deploy to static hosting
pnpm run deploy
```

### Environment Configuration

```typescript
// Environment variables
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  wasmPath: import.meta.env.VITE_WASM_PATH || '/wasm',
  telemetry: import.meta.env.VITE_TELEMETRY === 'true',
  debug: import.meta.env.DEV,
};
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build

EXPOSE 5173

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]
```

## Browser Support

### Requirements

- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebAssembly**: Required for geometry operations
- **SharedArrayBuffer**: Required for multi-threaded WASM
- **WebGL 2**: Required for 3D rendering
- **File System Access API**: Optional, for better file handling

### Polyfills

```typescript
// Feature detection and polyfills
const checkSupport = () => {
  const support = {
    wasm: typeof WebAssembly !== 'undefined',
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    webgl2: !!document.createElement('canvas').getContext('webgl2'),
    fileSystem: 'showOpenFilePicker' in window,
  };

  if (!support.wasm) {
    throw new Error('WebAssembly not supported');
  }

  if (!support.sharedArrayBuffer) {
    console.warn('SharedArrayBuffer not available - performance may be limited');
  }

  return support;
};
```

## Troubleshooting

### Common Issues

**Graph not evaluating:**

- Check console for errors
- Verify all node connections
- Check parameter values

**3D viewport not rendering:**

- Check WebGL support
- Verify WASM module loaded
- Check browser console for errors

**Performance issues:**

- Reduce mesh quality
- Close unused nodes
- Clear cache

**File export failing:**

- Check export format support
- Verify graph is valid
- Check available disk space

### Debug Tools

```typescript
// Debug utilities
const debug = {
  // Graph inspection
  inspectGraph: (graph: Graph) => {
    console.table(
      graph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        dirty: n.dirty,
        outputs: Object.keys(n.outputs || {}),
      }))
    );
  },

  // Performance monitoring
  measureEvaluation: async (fn: () => Promise<void>) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`Evaluation took ${end - start}ms`);
  },

  // Memory usage
  checkMemory: () => {
    if ('memory' in performance) {
      console.log('Memory usage:', (performance as any).memory);
    }
  },
};
```

## Contributing

See [CONTRIBUTING.md](../../docs/development/CONTRIBUTING.md) for development guidelines.

## License

MPL-2.0 - See LICENSE in repository root
