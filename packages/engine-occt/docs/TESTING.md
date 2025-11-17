# OCCT WASM Testing Guide

**Package**: `@brepflow/engine-occt`  
**Purpose**: Documentation of testing strategies for OpenCASCADE WebAssembly integration  
**Last Updated**: 2025-11-17

## Overview

The `engine-occt` package provides WebAssembly bindings to OpenCASCADE Technology (OCCT) for exact B-Rep/NURBS geometry operations. Testing this package requires understanding the fundamental differences between Node.js and browser environments, particularly regarding WASM module loading and execution.

## Architecture Context

```
┌─────────────────────────────────────────────────────────┐
│                    BrepFlow Application                  │
├─────────────────────────────────────────────────────────┤
│  Browser Environment          │  Node.js Environment     │
│  ├─ Main Thread              │  ├─ Test Runner (Vitest) │
│  ├─ Web Workers              │  └─ CLI Tools            │
│  └─ WASM (with threads)      │                          │
├─────────────────────────────────────────────────────────┤
│         @brepflow/engine-occt (This Package)            │
│  ├─ OCCTGeometryProvider (Real WASM)                   │
│  ├─ MockGeometryProvider (Pure JS fallback)            │
│  └─ ProductionSafetyValidator (Real vs Mock detection)  │
└─────────────────────────────────────────────────────────┘
```

## Environment Differences

### Browser Environment (Production)

**Capabilities**:

- ✅ Full WASM module loading with `fetch()`
- ✅ Web Workers with SharedArrayBuffer
- ✅ Pthread support (COOP/COEP headers)
- ✅ Real-time geometry operations
- ✅ Streaming compilation for large WASM files

**Configuration Required**:

```typescript
// vite.config.ts
export default {
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
};
```

### Node.js Environment (Testing)

**Limitations**:

- ❌ No native `fetch()` (requires polyfill)
- ❌ `file://` protocol not supported for WASM loading
- ❌ No SharedArrayBuffer by default
- ❌ Web Workers emulation incomplete
- ⚠️ Pthread support varies by Node.js version

**Current Approach**: Use MockGeometryProvider for unit tests

## Test Categories

### 1. Unit Tests (Node.js with Mock Geometry)

**Purpose**: Test business logic, API interfaces, data structures  
**Environment**: Node.js with Vitest  
**Geometry Provider**: MockGeometryProvider

**What to Test**:

- ✅ API interface contracts
- ✅ Input validation
- ✅ Error handling
- ✅ Data structure transformations
- ✅ Caching logic
- ✅ Worker communication protocol

**What NOT to Test**:

- ❌ Actual geometry operations
- ❌ OCCT algorithm correctness
- ❌ Boolean operations
- ❌ STEP/IGES file I/O

**Example**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryContext } from '../src/context';
import { MockGeometryProvider } from '../src/mock-provider';

describe('GeometryContext', () => {
  let context: GeometryContext;

  beforeEach(() => {
    const provider = new MockGeometryProvider();
    context = new GeometryContext(provider);
  });

  it('should validate box parameters', async () => {
    await expect(context.createBox({ width: -1, height: 10, depth: 10 })).rejects.toThrow(
      'Width must be positive'
    );
  });

  it('should cache geometry results', async () => {
    const box1 = await context.createBox({ width: 10, height: 10, depth: 10 });
    const box2 = await context.createBox({ width: 10, height: 10, depth: 10 });

    expect(box1.id).toBe(box2.id); // Cache hit
  });
});
```

### 2. Integration Tests (Browser with Real OCCT)

**Purpose**: Validate actual geometry operations  
**Environment**: Browser with Playwright  
**Geometry Provider**: OCCTGeometryProvider

**What to Test**:

- ✅ WASM module loading
- ✅ Worker initialization
- ✅ Actual geometry creation
- ✅ Boolean operations
- ✅ STEP/IGES export
- ✅ Memory management

**Example**:

```typescript
import { test, expect } from '@playwright/test';

test('should create box geometry', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const result = await page.evaluate(async () => {
    const { GeometryContext, OCCTGeometryProvider } = window.BrepFlow;
    const provider = await OCCTGeometryProvider.create();
    const context = new GeometryContext(provider);

    const box = await context.createBox({
      width: 100,
      height: 50,
      depth: 30,
    });

    return {
      type: box.type,
      volume: box.properties.volume,
      surfaceArea: box.properties.surfaceArea,
    };
  });

  expect(result.type).toBe('Solid');
  expect(result.volume).toBeCloseTo(150000, 0); // 100*50*30
});
```

### 3. E2E Tests (Full Application Flow)

**Purpose**: Validate end-to-end workflows  
**Environment**: Browser with Playwright  
**Geometry Provider**: OCCTGeometryProvider (production configuration)

**What to Test**:

- ✅ Complete user workflows
- ✅ Node graph evaluation with real geometry
- ✅ Export to STEP/STL/IGES
- ✅ File import and processing
- ✅ Performance under load
- ✅ Memory leak detection

**Example**: See `tests/e2e/abacus-studio.e2e.test.ts`

## Test Environment Setup

### Unit Tests (packages/engine-occt/vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'tests/**',
        'test/**',
        '**/*.test.{js,ts,jsx,tsx}',
        'wasm/**', // Exclude WASM binaries
      ],
      lines: 60,
      functions: 70,
      branches: 60,
      statements: 60,
    },
  },
});
```

### Test Setup File (packages/engine-occt/test/setup.ts)

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Polyfill fetch for Node.js environment
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
  globalThis.Headers = Headers as any;
  globalThis.Request = Request as any;
  globalThis.Response = Response as any;
}

// Mock WASM module for tests
global.WebAssembly = global.WebAssembly || {};

beforeAll(() => {
  // Global test setup
  process.env.NODE_ENV = 'test';
  process.env.USE_MOCK_GEOMETRY = 'true';
});

afterAll(() => {
  // Global test cleanup
});

beforeEach(() => {
  // Per-test setup
});

afterEach(() => {
  // Per-test cleanup
});
```

## Known Test Failures

### OCCT WASM Loading in Node.js (4 tests)

**Tests**:

- `packages/engine-occt/tests/occt-provider.test.ts` (4 tests)

**Error**:

```
Failed to load OCCT after 3 attempts: fetch failed
TypeError: Cannot read properties of null (reading 'getStatus')
ProductionSafetyError: Real OCCT geometry system failed
```

**Root Cause**:

1. WASM module uses `fetch()` to load binary file
2. Node.js fetch (even with polyfill) doesn't support `file://` protocol
3. WASM loading requires HTTP server or different loading mechanism for Node.js

**Status**: **EXPECTED BEHAVIOR** ⚠️

**Why We Accept This**:

- Real OCCT only needed in browser (production environment)
- Unit tests use MockGeometryProvider successfully
- Integration/E2E tests in browser validate real OCCT
- No production impact (only affects Node.js test runner)

**Alternative Solutions Considered**:

1. ❌ **HTTP server in tests**: Adds complexity, slows tests
2. ❌ **Different WASM loading for Node**: Maintains two code paths
3. ✅ **Mock for unit tests, browser for integration**: Simple, effective

## Testing Best Practices

### 1. Use Production Safety Validator

```typescript
import { ProductionSafetyValidator } from '@brepflow/engine-occt';

// In tests
const validator = new ProductionSafetyValidator();
const provider = await validator.getProvider(); // Auto-selects Mock in Node.js

// In production
if (!validator.isUsingRealGeometry()) {
  console.warn('Using mock geometry - not suitable for production');
}
```

### 2. Test with Both Providers

```typescript
import { describe, it } from 'vitest';
import { testWithProviders } from './test-utils';

testWithProviders('should create box', async (provider) => {
  const context = new GeometryContext(provider);
  const box = await context.createBox({ width: 10, height: 10, depth: 10 });

  expect(box.type).toBe('Solid');
  // Provider-agnostic assertions
});
```

### 3. Skip OCCT-Specific Tests in Node.js

```typescript
import { describe, it, vi } from 'vitest';

describe.skipIf(process.env.NODE_ENV === 'test')('OCCT-specific tests', () => {
  it('should perform boolean union', async () => {
    // Real OCCT required
  });
});
```

### 4. Use Golden Files for Geometry Validation

```typescript
import { readFileSync } from 'fs';
import { parseSTEP } from '@brepflow/step-parser';

it('should match golden STEP output', async () => {
  const result = await context.exportSTEP(geometry);
  const golden = readFileSync('fixtures/box-10x10x10.step', 'utf8');

  const resultData = parseSTEP(result);
  const goldenData = parseSTEP(golden);

  expect(resultData.volume).toBeCloseTo(goldenData.volume, 2);
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Run unit tests (with Mock)
        run: pnpm run test
        env:
          USE_MOCK_GEOMETRY: 'true'

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests (with Real OCCT)
        run: pnpm run test:e2e
        env:
          USE_MOCK_GEOMETRY: 'false'
```

## Coverage Targets

### Current Coverage (packages/engine-occt)

```
Lines      : 3.85% (8/208)
Functions  : 4.76% (3/63)
Branches   : 0% (0/0)
Statements : 3.85% (8/208)
```

### Target Coverage (by component)

```typescript
// High coverage targets (pure logic)
- Input validation: 80%+
- Error handling: 80%+
- Data structures: 90%+
- Caching logic: 80%+

// Medium coverage targets (integration)
- Worker communication: 60%+
- API interfaces: 70%+

// Low coverage targets (WASM-dependent)
- Geometry operations: 40%+ (tested in browser)
- OCCT bindings: 30%+ (mostly E2E)
```

## Mock Geometry Provider

### Purpose

Provides deterministic, fast geometry simulation for unit tests without requiring WASM.

### Capabilities

```typescript
export class MockGeometryProvider implements GeometryProvider {
  // Primitives
  async createBox(params: BoxParams): Promise<Shape>;
  async createSphere(params: SphereParams): Promise<Shape>;
  async createCylinder(params: CylinderParams): Promise<Shape>;

  // Operations (simplified)
  async union(shapes: Shape[]): Promise<Shape>;
  async intersection(shapes: Shape[]): Promise<Shape>;
  async difference(base: Shape, tool: Shape): Promise<Shape>;

  // Export (mock format)
  async exportSTEP(shape: Shape): Promise<string>;
  async exportSTL(shape: Shape): Promise<ArrayBuffer>;
}
```

### Limitations

- ❌ No actual geometry computation
- ❌ No validation of geometric impossibilities
- ❌ Simplified property calculations (volume, area)
- ❌ No STEP/IGES parsing
- ✅ Fast, deterministic, no dependencies
- ✅ Sufficient for API contract testing

### When to Use

- ✅ Unit tests for business logic
- ✅ CI/CD pipeline (fast feedback)
- ✅ Development without WASM compilation
- ❌ Geometry algorithm validation
- ❌ Production environments
- ❌ STEP/IGES interoperability testing

## Debugging Tips

### Enable WASM Loading Logs

```typescript
// In browser console or test setup
localStorage.setItem('DEBUG_WASM', 'true');
```

### Inspect Worker Communication

```typescript
// In worker message handler
self.addEventListener('message', (event) => {
  console.log('[Worker] Received:', event.data);
  // ... handle message
  self.postMessage({ type: 'result', data: result });
  console.log('[Worker] Sent:', result);
});
```

### Verify OCCT Initialization

```typescript
const provider = new OCCTGeometryProvider();
const isReady = await provider.initialize();

if (!isReady) {
  console.error('OCCT failed to initialize');
  console.log('Module status:', provider.getModuleStatus());
}
```

### Test with Production Build

```bash
# Build production WASM
pnpm run build:wasm

# Run dev server with production WASM
pnpm run dev

# Run E2E tests
pnpm run test:e2e
```

## Future Improvements

### Short Term

1. **Increase unit test coverage**: Target 60% lines for pure logic
2. **Add integration test suite**: Browser-based geometry validation
3. **Golden file system**: STEP/IGES reference outputs
4. **Performance benchmarks**: Track geometry operation times

### Medium Term

1. **Node.js WASM loading**: Support file:// protocol or different loading
2. **Parallel test execution**: Independent browser contexts
3. **Visual regression testing**: 3D viewport screenshots
4. **Memory leak detection**: Automated monitoring

### Long Term

1. **Fuzzing**: Automated invalid input generation
2. **Property-based testing**: Geometric invariant validation
3. **Cross-platform testing**: Windows, macOS, Linux WASM builds
4. **Performance regression tracking**: CI/CD integration

## References

- [OpenCASCADE Technology Documentation](https://dev.opencascade.org/)
- [Emscripten WASM Compilation](https://emscripten.org/docs/compiling/WebAssembly.html)
- [Playwright Testing Documentation](https://playwright.dev/)
- [Vitest Testing Framework](https://vitest.dev/)

## Support

For testing questions or issues:

- **Internal**: See `claudedocs/TESTING_FINAL_REPORT.md`
- **WASM build**: See `scripts/build-occt.sh`
- **CI/CD**: See `.github/workflows/test.yml` (when created)
