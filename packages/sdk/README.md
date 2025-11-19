# @brepflow/sdk

Official SDK for creating custom nodes and plugins for BrepFlow.

## Overview

The BrepFlow SDK enables developers to extend BrepFlow with:

- **Custom Nodes**: Create parametric geometry operations
- **Plugins**: Add new functionality and UI panels
- **Commands**: Register custom actions and shortcuts
- **Integrations**: Connect to external services and APIs

## Installation

```bash
pnpm add @brepflow/sdk
```

## Quick Start

### Creating a Custom Node

```typescript
import { NodeBuilder } from '@brepflow/sdk';

const customBox = new NodeBuilder<
  { scale: number },
  { shape: Shape },
  { width: number; height: number; depth: number }
>('Custom::ScalableBox')
  .name('Scalable Box')
  .description('A box that can be scaled uniformly')
  .category('Custom')
  .param('width', 'number', 100, { min: 1, max: 1000 })
  .param('height', 'number', 50, { min: 1, max: 1000 })
  .param('depth', 'number', 25, { min: 1, max: 1000 })
  .input('scale', 'number', 'Scale factor')
  .output('shape', 'Shape', 'Resulting shape')
  .evaluate(async (ctx, inputs, params) => {
    const { scale } = inputs;
    const { width, height, depth } = params;

    const shape = await ctx.worker.invoke('MAKE_BOX', {
      width: width * scale,
      height: height * scale,
      depth: depth * scale,
    });

    return { shape };
  })
  .build();
```

### Creating a Plugin

```typescript
import { BrepFlowPlugin, PluginManifest, PluginPermission } from '@brepflow/sdk';

export class MyPlugin extends BrepFlowPlugin {
  get manifest(): PluginManifest {
    return {
      id: 'my-plugin',
      name: 'My Custom Plugin',
      version: '1.0.0',
      author: 'Your Name',
      description: 'Adds custom functionality to BrepFlow',
      nodes: ['Custom::ScalableBox'],
      permissions: [
        PluginPermission.READ_GRAPH,
        PluginPermission.WRITE_GRAPH,
        PluginPermission.UI_PANEL,
      ],
    };
  }

  async onLoad(context) {
    await super.onLoad(context);
    context.logger.info('Plugin loaded successfully');
  }

  async onActivate() {
    await super.onActivate();
    this.context.logger.info('Plugin activated');
  }

  getNodes() {
    return [customBox]; // Return your custom nodes
  }

  getCommands() {
    return [
      {
        id: 'my-plugin:do-something',
        name: 'Do Something',
        description: 'Perform a custom action',
        shortcut: 'Ctrl+Shift+D',
        async execute(context) {
          context.logger.info('Command executed!');
          context.ui?.showNotification({
            type: 'success',
            title: 'Success',
            message: 'Custom command executed',
          });
        },
      },
    ];
  }

  getPanels() {
    return [
      {
        id: 'my-plugin:panel',
        title: 'My Panel',
        position: 'right',
        render() {
          const panel = document.createElement('div');
          panel.innerHTML = '<h3>Custom Panel</h3><p>Content here</p>';
          return panel;
        },
      },
    ];
  }
}
```

## API Reference

### NodeBuilder

Fluent API for creating custom nodes.

#### Methods

- **`name(name: string)`** - Set node display name
- **`description(desc: string)`** - Set node description
- **`category(category: string)`** - Set node category
- **`input<K>(name: K, type: string, description?)`** - Add input socket
- **`output<K>(name: K, type: string, description?)`** - Add output socket
- **`param<K>(name: K, type, defaultValue, options?)`** - Add parameter
- **`evaluate(fn)`** - Set evaluation function
- **`build()`** - Build the node definition

#### Parameter Types

```typescript
// Number parameter
.param('radius', 'number', 50, {
  min: 0,
  max: 1000,
  step: 1,
  unit: 'mm'
})

// String parameter
.param('name', 'string', 'Part', {
  maxLength: 255
})

// Boolean parameter
.param('enabled', 'boolean', true)

// Select parameter
.param('mode', 'select', 'fast', {
  options: [
    { value: 'fast', label: 'Fast' },
    { value: 'precise', label: 'Precise' }
  ]
})
```

### BrepFlowPlugin

Base class for plugins.

#### Properties

- **`manifest: PluginManifest`** - Plugin metadata (required)
- **`context: PluginContext`** - Plugin runtime context

#### Lifecycle Methods

- **`onLoad(context)`** - Called when plugin loads
- **`onActivate()`** - Called when plugin activates
- **`onDeactivate()`** - Called when plugin deactivates
- **`onUnload()`** - Called when plugin unloads

#### Component Registration

- **`getNodes()`** - Return array of custom nodes
- **`getCommands()`** - Return array of custom commands
- **`getPanels()`** - Return array of UI panels

### PluginContext

Runtime context provided to plugins.

```typescript
interface PluginContext {
  // Core APIs
  worker: WorkerAPI;          // Geometry worker
  logger: Logger;             // Logging
  storage: Storage;           // Persistent storage
  events: EventEmitter;       // Event system

  // Optional APIs (permission-based)
  ui?: UIContext;            // UI components
  viewport?: ViewportContext; // 3D viewport
  network?: NetworkContext;   // Network access
  files?: FileSystemContext;  // File system
}
```

#### Logger API

```typescript
context.logger.debug('Debug message', data);
context.logger.info('Info message');
context.logger.warn('Warning message');
context.logger.error('Error message', error);
```

#### Storage API

```typescript
// Store data
await context.storage.set('key', { data: 'value' });

// Retrieve data
const data = await context.storage.get('key');

// Delete data
await context.storage.delete('key');

// List keys
const keys = await context.storage.keys();

// Clear all
await context.storage.clear();
```

#### Events API

```typescript
// Subscribe to events
context.events.on('graph:changed', (graph) => {
  console.log('Graph changed', graph);
});

// Emit events
context.events.emit('custom:event', data);

// One-time subscription
context.events.once('plugin:ready', () => {
  console.log('Ready!');
});

// Unsubscribe
const handler = () => {};
context.events.on('event', handler);
context.events.off('event', handler);
```

#### UI API

```typescript
// Show modal
const result = await context.ui.showModal({
  title: 'Confirm Action',
  content: 'Are you sure?',
  buttons: [
    { text: 'Cancel', type: 'secondary', onClick: () => false },
    { text: 'Confirm', type: 'primary', onClick: () => true },
  ],
});

// Show notification
context.ui.showNotification({
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  duration: 3000,
});

// Register panel
context.ui.registerPanel({
  id: 'my-panel',
  title: 'My Panel',
  position: 'right',
  render: () => {
    const div = document.createElement('div');
    div.textContent = 'Panel content';
    return div;
  },
});
```

#### Viewport API

```typescript
// Get camera state
const camera = context.viewport.getCamera();

// Set camera state
context.viewport.setCamera({
  position: [100, 100, 100],
  target: [0, 0, 0],
  up: [0, 0, 1],
});

// Add overlay
const overlayId = context.viewport.addOverlay({
  type: 'line',
  data: {
    start: [0, 0, 0],
    end: [100, 0, 0],
  },
  style: { color: '#ff0000', width: 2 },
});

// Remove overlay
context.viewport.removeOverlay(overlayId);

// Capture screenshot
const blob = await context.viewport.captureScreenshot();
```

### Plugin Permissions

Plugins must declare required permissions in their manifest.

```typescript
enum PluginPermission {
  // Data access
  READ_GRAPH = 'read:graph',
  WRITE_GRAPH = 'write:graph',
  READ_FILES = 'read:files',
  WRITE_FILES = 'write:files',

  // Network
  NETWORK_FETCH = 'network:fetch',
  NETWORK_WEBSOCKET = 'network:websocket',

  // System
  WORKER_SPAWN = 'worker:spawn',
  WASM_EXECUTE = 'wasm:execute',

  // UI
  UI_MODAL = 'ui:modal',
  UI_NOTIFICATION = 'ui:notification',
  UI_PANEL = 'ui:panel',

  // Advanced
  NATIVE_CODE = 'native:code',
  SYSTEM_INFO = 'system:info',
}
```

## Examples

### Example 1: Parametric Bracket

```typescript
import { NodeBuilder } from '@brepflow/sdk';

const bracketNode = new NodeBuilder('Custom::ParametricBracket')
  .name('Parametric Bracket')
  .description('Creates a mounting bracket with holes')
  .category('Custom')
  .param('width', 'number', 100, { min: 20, max: 500 })
  .param('height', 'number', 80, { min: 20, max: 500 })
  .param('thickness', 'number', 5, { min: 2, max: 20 })
  .param('holeRadius', 'number', 5, { min: 2, max: 20 })
  .param('holeSpacing', 'number', 50, { min: 10, max: 200 })
  .output('shape', 'Shape')
  .evaluate(async (ctx, inputs, params) => {
    const { width, height, thickness, holeRadius, holeSpacing } = params;

    // Create base plate
    const plate = await ctx.worker.invoke('MAKE_BOX', {
      width,
      height,
      depth: thickness,
    });

    // Create mounting holes
    const holes = [];
    const numHoles = Math.floor(width / holeSpacing);

    for (let i = 0; i < numHoles; i++) {
      const x = (i + 1) * holeSpacing - width / 2;
      const hole = await ctx.worker.invoke('MAKE_CYLINDER', {
        radius: holeRadius,
        height: thickness * 2,
        centerX: x,
        centerY: 0,
        centerZ: 0,
      });
      holes.push(hole);
    }

    // Subtract holes from plate
    const result = await ctx.worker.invoke('BOOLEAN_SUBTRACT', {
      base: plate,
      tools: holes,
    });

    return { shape: result };
  })
  .build();
```

### Example 2: Text Engraving Plugin

```typescript
import { BrepFlowPlugin, PluginPermission } from '@brepflow/sdk';

export class TextEngravingPlugin extends BrepFlowPlugin {
  get manifest() {
    return {
      id: 'text-engraving',
      name: 'Text Engraving',
      version: '1.0.0',
      author: 'Your Name',
      description: 'Adds text engraving capability',
      permissions: [
        PluginPermission.READ_GRAPH,
        PluginPermission.WRITE_GRAPH,
        PluginPermission.UI_PANEL,
      ],
    };
  }

  getNodes() {
    return [
      new NodeBuilder('Engraving::Text')
        .name('Engrave Text')
        .description('Engrave text onto a surface')
        .category('Engraving')
        .input('surface', 'Face')
        .param('text', 'string', 'Hello World')
        .param('fontSize', 'number', 12, { min: 6, max: 72 })
        .param('depth', 'number', 1, { min: 0.1, max: 10 })
        .param('font', 'select', 'Arial', {
          options: [
            { value: 'Arial', label: 'Arial' },
            { value: 'Times', label: 'Times New Roman' },
            { value: 'Courier', label: 'Courier' },
          ],
        })
        .output('shape', 'Shape')
        .evaluate(async (ctx, inputs, params) => {
          const { surface } = inputs;
          const { text, fontSize, depth, font } = params;

          // Convert text to path
          const textPath = await this.generateTextPath(text, fontSize, font);

          // Extrude path
          const textShape = await ctx.worker.invoke('EXTRUDE', {
            profile: textPath,
            distance: depth,
          });

          // Subtract from surface
          const result = await ctx.worker.invoke('BOOLEAN_SUBTRACT', {
            base: surface,
            tools: [textShape],
          });

          return { shape: result };
        })
        .build(),
    ];
  }

  private async generateTextPath(text: string, size: number, font: string) {
    // Implementation for converting text to SVG path
    // This would use a font rendering library
    return null; // Placeholder
  }
}
```

### Example 3: Export to External Service

```typescript
import { BrepFlowPlugin, PluginPermission } from '@brepflow/sdk';

export class CloudExportPlugin extends BrepFlowPlugin {
  get manifest() {
    return {
      id: 'cloud-export',
      name: 'Cloud Export',
      version: '1.0.0',
      author: 'Your Name',
      description: 'Export models to cloud manufacturing service',
      permissions: [
        PluginPermission.READ_GRAPH,
        PluginPermission.NETWORK_FETCH,
        PluginPermission.UI_NOTIFICATION,
      ],
    };
  }

  getCommands() {
    return [
      {
        id: 'cloud-export:upload',
        name: 'Export to Cloud',
        description: 'Upload model to manufacturing service',
        icon: 'cloud-upload',
        async execute(context) {
          try {
            // Get current graph
            const graph = await context.worker.invoke('GET_CURRENT_GRAPH');

            // Export to STEP
            const stepData = await context.worker.invoke('EXPORT_STEP', { graph });

            // Upload to service
            const response = await context.network.fetch('https://api.example.com/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: stepData,
            });

            const result = await response.json();

            context.ui.showNotification({
              type: 'success',
              title: 'Export Successful',
              message: `Model uploaded: ${result.id}`,
              actions: [
                {
                  text: 'View Online',
                  onClick: () => window.open(result.url, '_blank'),
                },
              ],
            });
          } catch (error) {
            context.logger.error('Export failed', error);
            context.ui.showNotification({
              type: 'error',
              title: 'Export Failed',
              message: error.message,
            });
          }
        },
      },
    ];
  }
}
```

## Plugin Development Workflow

### 1. Project Setup

```bash
mkdir my-brepflow-plugin
cd my-brepflow-plugin
pnpm init
pnpm add @brepflow/sdk
pnpm add -D typescript tsup
```

### 2. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Build Configuration

Create `tsup.config.ts`:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@brepflow/sdk'],
});
```

### 4. Package Configuration

Update `package.json`:

```json
{
  "name": "my-brepflow-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublish": "pnpm build"
  }
}
```

### 5. Plugin Implementation

Create `src/index.ts`:

```typescript
import { BrepFlowPlugin } from '@brepflow/sdk';

export default class MyPlugin extends BrepFlowPlugin {
  // Implementation here
}
```

### 6. Testing

```bash
# Link locally
cd my-brepflow-plugin
pnpm link

# In BrepFlow project
pnpm link my-brepflow-plugin
```

### 7. Publishing

```bash
# Build
pnpm build

# Publish to npm
pnpm publish
```

## Best Practices

### Security

1. **Request minimal permissions** - Only request permissions you actually need
2. **Validate inputs** - Always validate user inputs and external data
3. **Handle errors** - Provide graceful error handling and user feedback
4. **Sandbox code** - Plugins run in isolated contexts

### Performance

1. **Async operations** - Use async/await for geometry operations
2. **Batch operations** - Combine multiple geometry operations when possible
3. **Cache results** - Store computed results to avoid redundant calculations
4. **Worker threads** - Heavy computations run in web workers automatically

### User Experience

1. **Clear naming** - Use descriptive names for nodes and parameters
2. **Helpful descriptions** - Provide clear descriptions and tooltips
3. **Sensible defaults** - Choose good default values for parameters
4. **Progress feedback** - Show progress for long-running operations

### Code Quality

1. **Type safety** - Use TypeScript for type checking
2. **Error handling** - Catch and handle errors appropriately
3. **Documentation** - Document your nodes and APIs
4. **Testing** - Write unit tests for your plugin logic

## Troubleshooting

### Plugin Not Loading

- Check manifest validity (id, name, version required)
- Verify permissions are declared correctly
- Check browser console for errors

### Node Not Appearing

- Ensure node is returned from `getNodes()`
- Check node ID is unique
- Verify category exists

### Permission Denied

- Add required permission to manifest
- User may have denied permission request

### Geometry Operations Failing

- Check input types match expected types
- Verify parameter values are valid
- Use try/catch for error handling

## Resources

- [API Documentation](../../docs/api/API_OVERVIEW.md)
- [Node Development Guide](../../docs/api/NODE_DEVELOPMENT.md)
- [Example Plugins](../../examples/plugins/)
- [BrepFlow Types](../types/README.md)

## License

MPL-2.0 - See LICENSE in repository root
