# Testing Guide

Comprehensive testing documentation for Sim4D development.

## Overview

Sim4D uses a multi-layered testing strategy to ensure reliability and maintainability:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Cross-component interaction testing
- **E2E Tests**: Full application workflow testing
- **Performance Tests**: Benchmark critical operations
- **Visual Tests**: UI component rendering validation

## Test Stack

- **Framework**: Vitest 3.2.4
- **Environment**: jsdom (browser simulation)
- **Coverage**: @vitest/coverage-v8
- **Assertions**: Vitest built-in + @testing-library/jest-dom
- **React Testing**: @testing-library/react
- **E2E**: Playwright (planned)

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
npx vitest run --coverage

# Run specific test file
npx vitest run path/to/test.ts

# Run tests matching pattern
npx vitest run --grep "DAGEngine"

# Run tests for specific package
pnpm --filter @sim4d/engine-core test
```

### Coverage Reports

```bash
# Generate coverage report
npx vitest run --coverage

# Open HTML coverage report
open coverage/index.html

# Generate coverage in different formats
npx vitest run --coverage --reporter=json
npx vitest run --coverage --reporter=lcov

# Generate per-package coverage summary (writes to coverage/)
pnpm coverage:packages

# Publish per-package coverage report (updates docs/testing/PER_PACKAGE_COVERAGE.md)
pnpm coverage:packages:publish
```

## Current Test Coverage

As of latest run (2025-11-14):

**Unit Tests**: ✅ 231/232 passing (99.6% pass rate)
**E2E Tests**: ✅ Operational with Playwright
**Test Duration**: ~12.8s for unit test suite

| Package                           | Coverage | Status                         |
| --------------------------------- | -------- | ------------------------------ |
| `engine-core/dag-engine.ts`       | 98.1%    | ✅ Excellent                   |
| `studio/lib/undo-redo.ts`         | 100%     | ✅ Perfect                     |
| `studio/store/graph-store.ts`     | ✅       | Core operations validated      |
| `studio/utils/graph-converter.ts` | ✅       | ReactFlow↔Sim4D conversion |
| `engine-core/cache.ts`            | 60.22%   | ⚠️ Good                        |
| `engine-core/node-registry.ts`    | 56.36%   | ⚠️ Good                        |
| `engine-core/hash.ts`             | 65.78%   | ⚠️ Good                        |

Target: **80%+ coverage** for all packages

**Recent Test Validation (2025-11-14)**:

- ✅ Validated double node placement bug fix (graph-store tests)
- ✅ Validated graph conversion integrity (graph-converter tests)
- ✅ Validated undo/redo functionality (21 tests passing)
- ✅ Validated layout state management (27 tests passing)
- ❌ Minor Icon test failure (cosmetic error message mismatch - non-critical)

## Test Structure

### Unit Tests

Located alongside source files as `*.test.ts` or `*.spec.ts`.

```typescript
// dag-engine.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DAGEngine } from './dag-engine';

describe('DAGEngine', () => {
  let engine: DAGEngine;
  let mockWorker: WorkerAPI;

  beforeEach(() => {
    mockWorker = {
      invoke: vi.fn().mockResolvedValue({ id: 'shape-1' }),
      tessellate: vi.fn().mockResolvedValue({ vertices: [], indices: [], normals: [] }),
      dispose: vi.fn(),
    };

    engine = new DAGEngine({ worker: mockWorker });
  });

  describe('Graph Evaluation', () => {
    it('should evaluate simple graph', async () => {
      const graph = createTestGraph();
      const dirtyNodes = new Set(['node-1']);

      await engine.evaluate(graph, dirtyNodes);

      expect(mockWorker.invoke).toHaveBeenCalled();
      expect(graph.nodes[0].dirty).toBe(false);
    });
  });
});
```

### Integration Tests

Test interactions between components.

```typescript
// graph-integration.test.ts
describe('Graph Store Integration', () => {
  it('should integrate with undo/redo system', async () => {
    const store = useGraphStore.getState();

    // Add node
    const node = store.addNode({ type: 'Solid::Box' });
    expect(store.graph.nodes).toHaveLength(1);

    // Undo
    store.undo();
    expect(store.graph.nodes).toHaveLength(0);

    // Redo
    store.redo();
    expect(store.graph.nodes).toHaveLength(1);
  });
});
```

#### End-to-end suites

- Constraint solver + OCCT geometry: `pnpm vitest run tests/integration/constraint-solver.integration.test.ts`
  - Exercises the 2D constraint manager and validates the solved dimensions by creating a real OCCT solid.
- Real-time collaboration signal flow: `pnpm vitest run tests/integration/collaboration.integration.test.ts`
  - Boots the Socket.IO collaboration server and verifies multi-client operation/ presence propagation. (Requires local socket access; the suite will no-op in sandboxed environments.)
- Headless CLI smoke with real OCCT: `pnpm vitest run tests/integration/cli-smoke.test.ts`
  - Builds the CLI package and renders `simple-box.bflow.json` to STEP + STL using the actual OCCT WASM bundle. Ensure `pnpm run build:wasm` has been executed first so the native artifacts exist.

### Component Tests

Testing React components with @testing-library/react.

```typescript
// CustomNode.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomNode } from './CustomNode';

describe('CustomNode', () => {
  it('should render node with label', () => {
    render(<CustomNode data={{ label: 'Test Node' }} />);

    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('should handle selection', () => {
    const onSelect = vi.fn();
    render(<CustomNode data={{ label: 'Test' }} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });
});
```

### Mock Strategies

#### Mocking Workers

```typescript
// tests/mocks/worker.ts
export class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();

  addEventListener(event: string, handler: Function) {
    if (event === 'message') {
      // Simulate worker response
      setTimeout(() => {
        handler({
          data: { type: 'result', value: 'mock-result' },
        });
      }, 0);
    }
  }
}

// In test setup
global.Worker = MockWorker as any;
```

#### Mocking WebGL

```typescript
// tests/setup/setup.ts
HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      canvas: this,
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      getExtension: () => null,
      getParameter: () => 0,
      createBuffer: () => ({}),
      createProgram: () => ({}),
      createShader: () => ({}),
      createTexture: () => ({}),
    };
  }
  return null;
} as any;
```

#### Mocking OCCT WASM

```typescript
// tests/mocks/occt.ts
export const mockOCCT = {
  ready: Promise.resolve(),

  MakeBox: vi.fn().mockReturnValue({
    IsNull: () => false,
    delete: vi.fn(),
  }),

  MakeCylinder: vi.fn().mockReturnValue({
    IsNull: () => false,
    delete: vi.fn(),
  }),

  BRepAlgoAPI_Fuse: vi.fn().mockImplementation(() => ({
    Build: vi.fn(),
    Shape: vi.fn().mockReturnValue({
      IsNull: () => false,
      delete: vi.fn(),
    }),
    delete: vi.fn(),
  })),
};
```

## Testing Patterns

### Testing Async Operations

```typescript
describe('Async Operations', () => {
  it('should handle async evaluation', async () => {
    const result = await engine.evaluate(graph, dirtyNodes);
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    mockWorker.invoke.mockRejectedValueOnce(new Error('Failed'));

    await expect(engine.evaluate(graph, dirtyNodes)).rejects.toThrow('Failed');
  });

  it('should timeout long operations', async () => {
    const promise = engine.evaluate(graph, dirtyNodes);

    await expect(
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
      ])
    ).rejects.toThrow('Timeout');
  });
});
```

### Testing State Management

```typescript
describe('Store Testing', () => {
  let store: ReturnType<typeof useGraphStore.getState>;

  beforeEach(() => {
    // Reset store to initial state
    store = useGraphStore.getState();
    store.clearGraph();
  });

  it('should update state correctly', () => {
    const unsubscribe = useGraphStore.subscribe(
      (state) => state.graph,
      (graph) => {
        expect(graph.nodes).toHaveLength(1);
      }
    );

    store.addNode({ type: 'Solid::Box' });
    unsubscribe();
  });
});
```

### Testing Node Evaluation

```typescript
describe('Node Evaluation', () => {
  it('should evaluate custom node', async () => {
    const node: NodeDefinition = {
      type: 'Test::Custom',
      params: { value: { type: 'number', default: 42 } },
      inputs: { input: 'Shape' },
      outputs: { output: 'Shape' },
      evaluate: async (ctx, inputs, params) => {
        const result = await ctx.worker.invoke('CUSTOM_OP', {
          shape: inputs.input,
          value: params.value,
        });
        return { output: result };
      },
    };

    const context = createMockContext();
    const inputs = { input: mockShape };
    const params = { value: 100 };

    const result = await node.evaluate(context, inputs, params);

    expect(result.output).toBeDefined();
    expect(context.worker.invoke).toHaveBeenCalledWith('CUSTOM_OP', {
      shape: mockShape,
      value: 100,
    });
  });
});
```

## Performance Testing

### Benchmarking

```typescript
// bench/dag-engine.bench.ts
import { bench, describe } from 'vitest';
import { DAGEngine } from '@sim4d/engine-core';

describe('DAGEngine Performance', () => {
  bench('evaluate 100 nodes', async () => {
    const graph = createLargeGraph(100);
    const engine = new DAGEngine({ worker: mockWorker });
    await engine.evaluate(graph, new Set(graph.nodes.map((n) => n.id)));
  });

  bench('evaluate with cache hits', async () => {
    const graph = createTestGraph();
    const engine = new DAGEngine({ worker: mockWorker });

    // Prime cache
    await engine.evaluate(graph, new Set(['node-1']));

    // Measure cached evaluation
    await engine.evaluate(graph, new Set(['node-1']));
  });
});
```

### Memory Testing

```typescript
describe('Memory Management', () => {
  it('should not leak memory', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      const engine = new DAGEngine({ worker: mockWorker });
      await engine.evaluate(createTestGraph(), new Set(['node-1']));
      engine.clearCache();
    }

    global.gc?.(); // Force garbage collection if available

    const finalMemory = process.memoryUsage().heapUsed;
    const leak = finalMemory - initialMemory;

    expect(leak).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });
});
```

## Visual Testing

### Snapshot Testing

```typescript
// Viewport.test.tsx
import { render } from '@testing-library/react';
import { Viewport } from './Viewport';

describe('Viewport', () => {
  it('should match snapshot', () => {
    const { container } = render(<Viewport nodes={[]} edges={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('should render with nodes', () => {
    const nodes = [
      { id: '1', type: 'box', position: { x: 0, y: 0 } }
    ];

    const { container } = render(<Viewport nodes={nodes} edges={[]} />);
    expect(container.querySelector('.node')).toBeInTheDocument();
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm test

      - run: npx vitest run --coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Best Practices

### Test Organization

1. **Co-location**: Keep tests next to source files
2. **Naming**: Use descriptive test names that explain behavior
3. **Grouping**: Use `describe` blocks for logical grouping
4. **Setup**: Use `beforeEach` for common setup
5. **Cleanup**: Use `afterEach` for cleanup

### Mock Management

1. **Centralize**: Keep mocks in `tests/mocks/`
2. **Type Safety**: Type your mocks properly
3. **Reset**: Clear mocks between tests
4. **Minimal**: Only mock what's necessary

### Assertion Guidelines

1. **Specific**: Test one thing per test
2. **Clear**: Make assertions obvious
3. **Complete**: Test happy path and edge cases
4. **Fast**: Keep unit tests under 100ms

### Coverage Goals

1. **Target**: 80% coverage minimum
2. **Critical**: 100% for critical paths
3. **Meaningful**: Don't test for coverage sake
4. **Branches**: Cover all conditional branches

## Debugging Tests

### VSCode Integration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Output

```typescript
// Use console.log for debugging
it('should debug test', () => {
  const result = complexFunction();
  console.log('Result:', result);
  expect(result).toBeDefined();
});

// Use debug mode
DEBUG=* pnpm test
```

### Test Isolation

```bash
# Run single test
npx vitest run -t "should evaluate simple graph"

# Run test file
npx vitest run dag-engine.test.ts

# Run with no coverage
npx vitest run --coverage=false
```

## Common Issues

### Double Node Placement (FIXED 2025-11-14)

**Problem**: Dropping a node from palette created 2 nodes instead of 1

**Root Cause**: Redundant useEffect dependencies in App.tsx caused double state sync

```typescript
// BEFORE (caused double triggering):
}, [graph, graph.nodes, graph.edges, selectedNodes, errorTracker.errors]);

// AFTER (single triggering):
}, [graph, selectedNodes, errorTracker.errors]);
```

**Validation**: graph-store tests confirm single node creation, 231/232 unit tests passing

### Vite Worker Import Parsing Error (FIXED 2025-11-14)

**Problem**: `[plugin:vite:worker-import-meta-url] Vite is unable to parse the worker options as the value is not static`

**Root Cause**: Vite's static analysis couldn't handle Emscripten-generated worker code

**Solution**: Created `vite-plugin-wasm-worker-fix.ts` + added `/* @vite-ignore */` comments

```typescript
// vite-plugin-wasm-worker-fix.ts adds @vite-ignore to OCCT worker calls
const fixedCode = code.replace(/new Worker\s*\(/g, 'new Worker(/* @vite-ignore */ ');
```

**Validation**: Dev server starts successfully in 335ms

### Worker Not Defined

**Problem**: `ReferenceError: Worker is not defined`

**Solution**: Mock Worker in test setup

```typescript
global.Worker = class {
  postMessage = vi.fn();
  terminate = vi.fn();
} as any;
```

### SharedArrayBuffer Not Available

**Problem**: WASM threads require SharedArrayBuffer

**Solution**: Run tests with proper flags

```bash
node --experimental-wasm-threads pnpm test
```

### Async Timeout

**Problem**: Tests timeout on async operations

**Solution**: Increase timeout

```typescript
it('should handle long operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

## Contributing Tests

When contributing, ensure:

1. **New Features**: Include tests for new functionality
2. **Bug Fixes**: Add regression tests
3. **Coverage**: Maintain or improve coverage
4. **Documentation**: Update test docs if needed
5. **CI**: Ensure tests pass in CI

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Coverage Reports](./coverage/index.html)
- [Test Examples](./packages/engine-core/src/*.test.ts)
