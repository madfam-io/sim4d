# Sim4D SDK Tutorial: Getting Started

This tutorial will guide you through creating your first custom node and plugin for Sim4D.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Creating Your First Custom Node](#creating-your-first-custom-node)
4. [Building a Complete Plugin](#building-a-complete-plugin)
5. [Testing Your Plugin](#testing-your-plugin)
6. [Publishing Your Plugin](#publishing-your-plugin)

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20.11.0 or later
- **pnpm** 8.6.7 or later
- **TypeScript** knowledge
- **Sim4D** installed locally or access to a Sim4D instance

## Project Setup

### Step 1: Create Project Directory

```bash
mkdir my-sim4d-plugin
cd my-sim4d-plugin
pnpm init
```

### Step 2: Install Dependencies

```bash
pnpm add @sim4d/sdk
pnpm add -D typescript tsup @types/node
```

### Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Configure Build

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
  external: ['@sim4d/sdk'],
  target: 'es2022',
});
```

### Step 5: Update package.json

```json
{
  "name": "my-sim4d-plugin",
  "version": "1.0.0",
  "description": "My first Sim4D plugin",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "keywords": ["sim4d", "plugin", "cad"],
  "author": "Your Name",
  "license": "MIT"
}
```

## Creating Your First Custom Node

### Step 1: Simple Box Node

Create `src/nodes/scalable-box.ts`:

```typescript
import { NodeBuilder } from '@sim4d/sdk';

export const ScalableBoxNode = new NodeBuilder(
  'Tutorial::ScalableBox'
)
  .name('Scalable Box')
  .description('Creates a box with uniform scaling')
  .category('Tutorial')

  // Parameters
  .param('width', 'number', 100, {
    min: 1,
    max: 1000,
    step: 1,
    unit: 'mm',
  })
  .param('height', 'number', 50, {
    min: 1,
    max: 1000,
    step: 1,
    unit: 'mm',
  })
  .param('depth', 'number', 25, {
    min: 1,
    max: 1000,
    step: 1,
    unit: 'mm',
  })
  .param('scale', 'number', 1.0, {
    min: 0.1,
    max: 10,
    step: 0.1,
  })

  // Output
  .output('shape', 'Shape', 'The resulting box')

  // Evaluation function
  .evaluate(async (ctx, inputs, params) => {
    const { width, height, depth, scale } = params;

    // Create box using OCCT geometry API
    const shape = await ctx.worker.invoke('MAKE_BOX', {
      width: width * scale,
      height: height * scale,
      depth: depth * scale,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
    });

    return { shape };
  })
  .build();
```

### Step 2: Node with Input

Create `src/nodes/pattern-array.ts`:

```typescript
import { NodeBuilder } from '@sim4d/sdk';

export const PatternArrayNode = new NodeBuilder(
  'Tutorial::PatternArray'
)
  .name('Pattern Array')
  .description('Create linear array of shapes')
  .category('Tutorial')

  // Input shape
  .input('shape', 'Shape', 'Shape to array')

  // Parameters
  .param('count', 'number', 5, {
    min: 1,
    max: 100,
    step: 1,
  })
  .param('spacingX', 'number', 50, {
    min: 0,
    max: 1000,
    unit: 'mm',
  })
  .param('spacingY', 'number', 0, {
    min: 0,
    max: 1000,
    unit: 'mm',
  })
  .param('merge', 'boolean', false)

  // Output
  .output('shapes', 'Shape[]', 'Array of shapes')

  .evaluate(async (ctx, inputs, params) => {
    const { shape } = inputs;
    const { count, spacingX, spacingY, merge } = params;

    if (!shape) {
      throw new Error('Input shape is required');
    }

    const shapes = [];

    for (let i = 0; i < count; i++) {
      const offsetX = i * spacingX;
      const offsetY = i * spacingY;

      const transformed = await ctx.worker.invoke('TRANSFORM_TRANSLATE', {
        shape,
        x: offsetX,
        y: offsetY,
        z: 0,
      });

      shapes.push(transformed);
    }

    if (merge && shapes.length > 0) {
      const merged = await ctx.worker.invoke('BOOLEAN_UNION', {
        shapes,
      });
      return { shapes: [merged] };
    }

    return { shapes };
  })
  .build();
```

### Step 3: Advanced Node with Validation

Create `src/nodes/parametric-bracket.ts`:

```typescript
import { NodeBuilder } from '@sim4d/sdk';

export const ParametricBracketNode = new NodeBuilder(
  'Tutorial::ParametricBracket'
)
  .name('Parametric Bracket')
  .description('L-shaped mounting bracket with holes')
  .category('Tutorial')

  .param('width', 'number', 100, { min: 20, max: 500, unit: 'mm' })
  .param('height', 'number', 80, { min: 20, max: 500, unit: 'mm' })
  .param('thickness', 'number', 5, { min: 2, max: 20, unit: 'mm' })
  .param('holeRadius', 'number', 5, { min: 2, max: 20, unit: 'mm' })
  .param('holeSpacing', 'number', 50, { min: 10, max: 200, unit: 'mm' })
  .param('filletRadius', 'number', 3, { min: 0, max: 10, unit: 'mm' })

  .output('shape', 'Shape')

  .evaluate(async (ctx, inputs, params) => {
    const { width, height, thickness, holeRadius, holeSpacing, filletRadius } = params;

    // Validation
    if (holeRadius * 2 >= holeSpacing) {
      throw new Error('Hole spacing must be at least 2x hole diameter');
    }

    if (filletRadius >= thickness) {
      throw new Error('Fillet radius must be less than thickness');
    }

    // Create base L-shape
    const base = await ctx.worker.invoke('MAKE_BOX', {
      width,
      height: thickness,
      depth: thickness,
    });

    const vertical = await ctx.worker.invoke('MAKE_BOX', {
      width: thickness,
      height,
      depth: thickness,
    });

    const verticalMoved = await ctx.worker.invoke('TRANSFORM_TRANSLATE', {
      shape: vertical,
      x: 0,
      y: 0,
      z: 0,
    });

    let bracket = await ctx.worker.invoke('BOOLEAN_UNION', {
      shapes: [base, verticalMoved],
    });

    // Add fillet if requested
    if (filletRadius > 0) {
      bracket = await ctx.worker.invoke('FILLET_EDGES', {
        shape: bracket,
        radius: filletRadius,
      });
    }

    // Create mounting holes
    const numHoles = Math.floor(width / holeSpacing);
    const holes = [];

    for (let i = 0; i < numHoles; i++) {
      const x = (i + 1) * holeSpacing - width / 2;

      const hole = await ctx.worker.invoke('MAKE_CYLINDER', {
        radius: holeRadius,
        height: thickness * 3,
        centerX: x,
        centerY: 0,
        centerZ: 0,
      });

      holes.push(hole);
    }

    // Subtract holes
    if (holes.length > 0) {
      bracket = await ctx.worker.invoke('BOOLEAN_SUBTRACT', {
        base: bracket,
        tools: holes,
      });
    }

    return { shape: bracket };
  })
  .build();
```

## Building a Complete Plugin

### Step 1: Create Plugin Class

Create `src/plugin.ts`:

```typescript
import { Sim4DPlugin, PluginManifest, PluginPermission } from '@sim4d/sdk';
import { ScalableBoxNode } from './nodes/scalable-box';
import { PatternArrayNode } from './nodes/pattern-array';
import { ParametricBracketNode } from './nodes/parametric-bracket';

export default class TutorialPlugin extends Sim4DPlugin {
  get manifest(): PluginManifest {
    return {
      id: 'tutorial-plugin',
      name: 'Tutorial Plugin',
      version: '1.0.0',
      author: 'Your Name',
      description: 'Example plugin demonstrating Sim4D SDK capabilities',
      homepage: 'https://github.com/yourusername/my-sim4d-plugin',
      license: 'MIT',

      // Declare nodes
      nodes: [
        'Tutorial::ScalableBox',
        'Tutorial::PatternArray',
        'Tutorial::ParametricBracket',
      ],

      // Request permissions
      permissions: [
        PluginPermission.READ_GRAPH,
        PluginPermission.WRITE_GRAPH,
        PluginPermission.UI_NOTIFICATION,
      ],
    };
  }

  async onLoad(context) {
    await super.onLoad(context);

    context.logger.info('Tutorial plugin loaded successfully!');

    // Setup initialization logic
    this.setupEventHandlers();
  }

  async onActivate() {
    await super.onActivate();

    this.context.ui?.showNotification({
      type: 'info',
      title: 'Tutorial Plugin Activated',
      message: 'New nodes available in the Tutorial category',
      duration: 3000,
    });
  }

  async onDeactivate() {
    await super.onDeactivate();

    this.context.logger.info('Tutorial plugin deactivated');
  }

  getNodes() {
    return [
      ScalableBoxNode,
      PatternArrayNode,
      ParametricBracketNode,
    ];
  }

  getCommands() {
    return [
      {
        id: 'tutorial:create-sample',
        name: 'Create Sample Graph',
        description: 'Create a sample graph using tutorial nodes',
        icon: 'file-plus',
        shortcut: 'Ctrl+Shift+T',
        async execute(context) {
          context.logger.info('Creating sample graph...');

          // Create sample graph with tutorial nodes
          const graph = await context.worker.invoke('CREATE_GRAPH', {
            nodes: [
              {
                type: 'Tutorial::ScalableBox',
                params: { width: 100, height: 50, depth: 25, scale: 1.5 },
              },
              {
                type: 'Tutorial::PatternArray',
                inputs: { shape: { nodeId: 'box', output: 'shape' } },
                params: { count: 5, spacingX: 120, spacingY: 0 },
              },
            ],
          });

          context.ui?.showNotification({
            type: 'success',
            title: 'Sample Created',
            message: 'Sample graph created successfully',
          });

          return graph;
        },
      },
    ];
  }

  private setupEventHandlers() {
    // Listen for graph changes
    this.context.events.on('graph:changed', (graph) => {
      this.context.logger.debug('Graph changed', graph.id);
    });

    // Listen for node evaluation
    this.context.events.on('node:evaluated', (nodeId, result) => {
      this.context.logger.debug('Node evaluated', nodeId, result);
    });
  }
}
```

### Step 2: Create Entry Point

Create `src/index.ts`:

```typescript
import TutorialPlugin from './plugin';

export default TutorialPlugin;

// Also export individual nodes for direct use
export { ScalableBoxNode } from './nodes/scalable-box';
export { PatternArrayNode } from './nodes/pattern-array';
export { ParametricBracketNode } from './nodes/parametric-bracket';
```

## Testing Your Plugin

### Step 1: Local Development

Create `test/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Test</title>
</head>
<body>
  <h1>Sim4D Plugin Test</h1>
  <div id="app"></div>

  <script type="module">
    import { pluginManager } from '@sim4d/sdk';
    import TutorialPlugin from '../dist/index.js';

    // Load plugin
    const plugin = new TutorialPlugin();
    await pluginManager.loadPlugin(plugin);

    // Activate plugin
    await pluginManager.activatePlugin('tutorial-plugin');

    console.log('Plugin loaded and activated!');
    console.log('Nodes:', plugin.getNodes());
    console.log('Commands:', plugin.getCommands());
  </script>
</body>
</html>
```

### Step 2: Unit Tests

Create `test/nodes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ScalableBoxNode } from '../src/nodes/scalable-box';

describe('ScalableBox Node', () => {
  it('should have correct configuration', () => {
    expect(ScalableBoxNode.id).toBe('Tutorial::ScalableBox');
    expect(ScalableBoxNode.name).toBe('Scalable Box');
    expect(ScalableBoxNode.category).toBe('Tutorial');
  });

  it('should have required parameters', () => {
    const params = ScalableBoxNode.params;
    expect(params.width).toBeDefined();
    expect(params.height).toBeDefined();
    expect(params.depth).toBeDefined();
    expect(params.scale).toBeDefined();
  });

  it('should have shape output', () => {
    expect(ScalableBoxNode.outputs.shape).toBeDefined();
  });
});
```

Add test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "vitest": "^4.0.9"
  }
}
```

### Step 3: Integration Testing

Create `test/integration.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { pluginManager } from '@sim4d/sdk';
import TutorialPlugin from '../src/index';

describe('Tutorial Plugin Integration', () => {
  let plugin: TutorialPlugin;

  beforeEach(async () => {
    plugin = new TutorialPlugin();
    await pluginManager.loadPlugin(plugin);
  });

  it('should load plugin successfully', () => {
    const loaded = pluginManager.getPlugins();
    expect(loaded.find(p => p.id === 'tutorial-plugin')).toBeDefined();
  });

  it('should register all nodes', () => {
    const nodes = plugin.getNodes();
    expect(nodes).toHaveLength(3);
    expect(nodes.map(n => n.id)).toContain('Tutorial::ScalableBox');
    expect(nodes.map(n => n.id)).toContain('Tutorial::PatternArray');
    expect(nodes.map(n => n.id)).toContain('Tutorial::ParametricBracket');
  });

  it('should register commands', () => {
    const commands = plugin.getCommands();
    expect(commands).toHaveLength(1);
    expect(commands[0].id).toBe('tutorial:create-sample');
  });
});
```

## Publishing Your Plugin

### Step 1: Prepare for Publishing

1. **Update package.json**:

```json
{
  "name": "@yourscope/sim4d-tutorial-plugin",
  "version": "1.0.0",
  "description": "Example plugin for Sim4D",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-sim4d-plugin.git"
  },
  "keywords": [
    "sim4d",
    "plugin",
    "cad",
    "parametric"
  ],
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

2. **Create README.md**:

```markdown
# Sim4D Tutorial Plugin

Example plugin demonstrating Sim4D SDK capabilities.

## Installation

\`\`\`bash
pnpm add @yourscope/sim4d-tutorial-plugin
\`\`\`

## Usage

\`\`\`typescript
import TutorialPlugin from '@yourscope/sim4d-tutorial-plugin';
import { pluginManager } from '@sim4d/sdk';

const plugin = new TutorialPlugin();
await pluginManager.loadPlugin(plugin);
\`\`\`

## Nodes

- **Tutorial::ScalableBox** - Creates scalable boxes
- **Tutorial::PatternArray** - Arrays shapes in patterns
- **Tutorial::ParametricBracket** - Creates mounting brackets

## License

MIT
```

3. **Create LICENSE file**

4. **Build the plugin**:

```bash
pnpm build
```

### Step 2: Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish
pnpm publish --access public
```

### Step 3: Test Installation

```bash
# In a new directory
mkdir test-install
cd test-install
pnpm init
pnpm add @yourscope/sim4d-tutorial-plugin
```

## Next Steps

Congratulations! You've created your first Sim4D plugin. Here are some ideas for extending it:

1. **Add More Nodes** - Create additional parametric operations
2. **Add UI Panels** - Create custom UI panels for your plugin
3. **Add External APIs** - Integrate with external services
4. **Add Export Formats** - Support additional file formats
5. **Add Validation** - Implement input validation and error handling

## Resources

- [Sim4D SDK API Reference](./API_OVERVIEW.md)
- [Node Development Guide](./NODE_DEVELOPMENT.md)
- [Plugin Examples](../../packages/examples/plugins/)
- [Sim4D Documentation](../../docs/README.md)

## Troubleshooting

### Plugin Not Loading

- Verify manifest is valid
- Check permissions are declared
- Look for errors in browser console

### Nodes Not Appearing

- Ensure nodes are returned from `getNodes()`
- Verify node IDs are unique
- Check category exists

### Build Errors

- Run `pnpm typecheck` to find TypeScript errors
- Verify all dependencies are installed
- Check tsup configuration

## Support

- [GitHub Issues](https://github.com/aureolabs/sim4d/issues)
- [Discord Community](https://discord.gg/sim4d)
- [Documentation](https://docs.sim4d.com)
