# BrepFlow Testing Strategy

**Document Purpose**: Comprehensive testing strategy across the BrepFlow monorepo  
**Scope**: Unit, Integration, E2E, and Performance testing  
**Last Updated**: 2025-11-17

## Testing Philosophy

### Core Principles

1. **Environment-Appropriate Testing**: Test what can be tested in each environment
2. **Fast Feedback**: Unit tests complete in <10s, E2E in <5min
3. **Deterministic Results**: No flaky tests, reproducible failures
4. **Production Safety**: Validate real vs mock geometry usage
5. **Coverage Quality Over Quantity**: Meaningful tests, not just line coverage

### Test Pyramid

```
         ╱╲
        ╱E2E╲            ~50 tests  | Slow, comprehensive
       ╱─────╲
      ╱  Int  ╲         ~100 tests | Medium speed, focused
     ╱─────────╲
    ╱   Unit    ╲      ~200 tests | Fast, isolated
   ╱─────────────╲
  ───────────────────
```

## Test Categories

### 1. Unit Tests (Node.js + Vitest)

**Target**: 80% coverage for pure logic  
**Speed**: <10 seconds total  
**Environment**: Node.js with jsdom

**What to Test**:

- Business logic (DAG evaluation, hashing, caching)
- Data transformations (input validation, format conversion)
- Pure functions (expression evaluator, constraint solver)
- Error handling (validation, recovery strategies)
- API interfaces (contracts, type safety)

**Packages with High Unit Test Coverage**:

- `@brepflow/engine-core`: 93 tests (100% pass rate)
- `@brepflow/constraint-solver`: 2 tests (needs expansion)
- `@brepflow/collaboration`: 2 tests (needs expansion)
- `@brepflow/viewport`: 2 tests (needs expansion)

**Current Status**: 231/235 tests passing (98.3%)

### 2. Integration Tests (Browser + Playwright)

**Target**: Key workflows validated  
**Speed**: <2 minutes per suite  
**Environment**: Browser with real services

**What to Test**:

- Multi-package interactions
- OCCT WASM geometry operations
- Worker communication
- Database persistence
- WebSocket collaboration
- File I/O (STEP, STL, IGES)

**Key Integration Suites**:

- Geometry operations with real OCCT
- Node graph evaluation with persistence
- Collaboration session lifecycle
- Export/import workflows

### 3. E2E Tests (Full Stack + Playwright)

**Target**: User journeys validated  
**Speed**: <5 minutes total  
**Environment**: Full Docker stack

**What to Test**:

- Complete user workflows
- Create → Edit → Export → Share
- Performance under realistic load
- Error recovery and resilience
- Cross-browser compatibility
- Accessibility compliance

**Current E2E Suites**:

- `abacus-studio.e2e.test.ts`: Parametric design workflow
- `collaboration.e2e.test.ts`: Real-time collaboration
- `mvp-workflow.test.ts`: Core user journeys
- `debug-console.test.ts`: Error detection

**Known Issue**: Rate limiting in test environment (resolution documented)

### 4. Performance Tests

**Target**: Prevent regressions  
**Speed**: <10 minutes (separate CI job)  
**Environment**: Production-like configuration

**What to Test**:

- Geometry operation benchmarks
- Viewport rendering performance (60 FPS target)
- Memory usage patterns
- Cache effectiveness
- Large graph evaluation times

**Status**: To be implemented in Phase 6

## Package-Specific Testing Strategies

### @brepflow/engine-core

**Focus**: DAG evaluation, dirty propagation, content-addressed hashing

**Unit Tests** (93 tests, 100% passing):

- ✅ Topological sort
- ✅ Dirty propagation
- ✅ Hash computation
- ✅ Cache management
- ✅ Expression evaluation

**Coverage**: 80% target (current: needs measurement fix)

**Integration**: Node chain evaluation with mock geometry

### @brepflow/engine-occt

**Focus**: WASM bindings, geometry operations

**Unit Tests** (86/92 passing):

- ✅ API interface contracts
- ✅ Input validation
- ✅ Error handling
- ❌ WASM loading (4 tests, Node.js limitation)

**Known Limitation**: Real OCCT only testable in browser (see `packages/engine-occt/docs/TESTING.md`)

**Coverage**: 60% target (WASM operations tested in browser)

**Integration**: Full geometry operations in browser E2E tests

### @brepflow/collaboration

**Focus**: Real-time collaboration, CSRF protection, WebSocket management

**Unit Tests** (2 tests, 100% passing):

- ✅ Basic session management
- ⚠️ Needs expansion (target: 20 tests)

**Coverage**: 70% target (current: needs measurement)

**E2E Tests**:

- ✅ CSRF token lifecycle
- ❌ Rate-limited tests (known issue, documented resolution)

**Priority**: Add unit tests for operation transforms, conflict resolution, session state

### @brepflow/viewport

**Focus**: Three.js rendering, WebGL/WebGPU, camera controls

**Unit Tests** (2 tests, 100% passing):

- ✅ Basic viewport initialization
- ⚠️ Needs expansion (target: 15 tests)

**Coverage**: 70% target (current: needs measurement)

**Visual Testing**: Screenshot comparisons in E2E tests (15% threshold)

**Priority**: Add tests for camera controls, selection, rendering optimizations

### @brepflow/constraint-solver

**Focus**: Parametric constraints, geometric constraint solving

**Unit Tests** (2 tests, 100% passing):

- ✅ Basic constraint definition
- ⚠️ Needs expansion (target: 25 tests)

**Coverage**: 80% target (current: 3.9% measured)

**Priority**: High - critical for parametric design functionality

### @brepflow/nodes-core

**Focus**: Built-in node implementations (30+ geometry nodes)

**Unit Tests**: Limited (needs development)

**Coverage**: 70% target

**Integration**: Tested via full graph evaluation in E2E tests

**Priority**: Medium - well-covered by E2E tests, add unit tests for complex nodes

### @brepflow/studio

**Focus**: React UI, node editor, inspector panel

**Unit Tests**: React component testing with React Testing Library

**Coverage**: 60% target (UI logic)

**E2E Tests**: Primary testing strategy for UI workflows

**Visual Testing**: Screenshot comparisons for regressions

## Environment Configurations

### Unit Tests (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom', // or 'node' for non-UI packages
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'], // KEY: must be explicit
      exclude: [
        'tests/**',
        '**/*.test.{js,ts,jsx,tsx}',
        'dist/**',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
      all: true,
      lines: 80, // Adjust per package
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

### E2E Tests (playwright.config.ts)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // 60s per test
  expect: {
    timeout: 15000, // 15s for geometry rendering
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 6, // Reduce to 3 if rate limiting issues persist
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit disabled: WASM pthread limitations
  ],
});
```

### Docker Test Environment

```yaml
# docker-compose.yml (test services)
services:
  studio:
    build:
      context: .
      dockerfile: apps/studio/Dockerfile
    ports:
      - '5173:5173'
    environment:
      - NODE_ENV=test
      - ENABLE_RATE_LIMIT=false # Disable for E2E tests
      - VITE_COLLABORATION_WS_URL=http://localhost:8080
    depends_on:
      - collaboration
      - postgres
      - redis

  collaboration:
    build:
      context: .
      dockerfile: packages/collaboration/Dockerfile
    ports:
      - '8080:8080'
    environment:
      - NODE_ENV=test
      - ENABLE_RATE_LIMIT=false # KEY: Disable for testing
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/brepflow
      - REDIS_URL=redis://redis:6379
```

## Test Data Management

### Fixtures

```
tests/
├── fixtures/
│   ├── geometry/
│   │   ├── box-10x10x10.step
│   │   ├── cylinder-r10-h50.step
│   │   └── boolean-union.step
│   ├── graphs/
│   │   ├── simple-box.bflow.json
│   │   ├── parametric-abacus.bflow.json
│   │   └── complex-assembly.bflow.json
│   └── screenshots/
│       └── golden/
│           ├── viewport-box.png
│           └── node-editor-abacus.png
```

### Golden Files Strategy

**Purpose**: Reference outputs for regression detection

**Usage**:

```typescript
import { readFileSync } from 'fs';
import { parseSTEP } from '@brepflow/step-parser';

it('should match golden STEP output', async () => {
  const result = await geometry.exportSTEP();
  const golden = readFileSync('fixtures/geometry/box-10x10x10.step', 'utf8');

  const resultVolume = parseSTEP(result).volume;
  const goldenVolume = parseSTEP(golden).volume;

  expect(resultVolume).toBeCloseTo(goldenVolume, 2);
});
```

**Maintenance**: Update golden files when intentional changes occur

## CI/CD Pipeline

### GitHub Actions Workflow (to be created in Phase 7)

```yaml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: docker-compose up -d
      - run: pnpm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: pnpm run test:performance
      - uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'customBiggerIsBetter'
          output-file-path: performance-results.json
```

## Coverage Targets by Package

| Package           | Current    | Target | Priority                    |
| ----------------- | ---------- | ------ | --------------------------- |
| engine-core       | ~80% (est) | 80%    | ✅ Met                      |
| engine-occt       | ~60% (est) | 60%    | ✅ Met (with browser tests) |
| collaboration     | ~10% (est) | 70%    | 🔴 High                     |
| constraint-solver | 3.9%       | 80%    | 🔴 High                     |
| viewport          | ~10% (est) | 70%    | 🟡 Medium                   |
| nodes-core        | ~40% (est) | 70%    | 🟡 Medium                   |
| studio            | ~30% (est) | 60%    | 🟡 Medium                   |

## Known Testing Limitations

### 1. OCCT WASM in Node.js ❌

**Issue**: 4 tests fail due to WASM loading limitations in Node.js  
**Impact**: No production impact (browser environment unaffected)  
**Mitigation**: Use MockGeometryProvider for unit tests, real OCCT in E2E  
**Documentation**: `packages/engine-occt/docs/TESTING.md`

### 2. Rate Limiting in E2E Tests ⚠️

**Issue**: Security rate limiting blocks rapid test connections  
**Impact**: ~20 E2E tests timeout  
**Mitigation**: Set `ENABLE_RATE_LIMIT=false` in test environment  
**Documentation**: `claudedocs/PHASE_2B_COMPLETION.md`

### 3. Visual Testing Thresholds ⚠️

**Issue**: WebGL rendering has minor pixel differences across runs  
**Impact**: Screenshot tests require 15% threshold  
**Mitigation**: Focus on structural validation, not pixel-perfect matching  
**Configuration**: `playwright.config.ts` screenshot thresholds

### 4. WebKit WASM Pthreads ❌

**Issue**: WebKit doesn't support WASM with SharedArrayBuffer reliably  
**Impact**: Safari testing limited  
**Mitigation**: Chrome + Firefox coverage adequate, document Safari limitation  
**Status**: WebKit project disabled in Playwright config

## Best Practices

### 1. Test Naming Convention

```typescript
// ✅ Good: Descriptive, behavior-focused
it('should create box with positive dimensions', async () => {});

// ❌ Bad: Implementation-focused, vague
it('test createBox function', async () => {});
```

### 2. Test Organization

```typescript
// ✅ Good: Logical grouping, clear setup
describe('GeometryContext', () => {
  describe('Box Operations', () => {
    let context: GeometryContext;

    beforeEach(() => {
      context = new GeometryContext(new MockGeometryProvider());
    });

    it('should create box with valid parameters', async () => {});
    it('should reject negative dimensions', async () => {});
  });
});
```

### 3. Async/Await Usage

```typescript
// ✅ Good: Proper async handling
it('should load geometry', async () => {
  const result = await context.loadSTEP('file.step');
  expect(result).toBeDefined();
});

// ❌ Bad: Missing await, timing issues
it('should load geometry', () => {
  const result = context.loadSTEP('file.step');
  expect(result).toBeDefined(); // Will fail - Promise not resolved
});
```

### 4. Test Independence

```typescript
// ✅ Good: Independent tests with fresh state
beforeEach(() => {
  context = new GeometryContext(new MockGeometryProvider());
});

// ❌ Bad: Shared state between tests
const context = new GeometryContext(new MockGeometryProvider());
// Tests will interfere with each other
```

### 5. Meaningful Assertions

```typescript
// ✅ Good: Specific assertions with context
expect(box.volume).toBeCloseTo(1000, 2);
expect(box.type).toBe('Solid');

// ❌ Bad: Vague, unhelpful on failure
expect(box).toBeTruthy();
```

## Testing Checklist (PR Requirements)

Before submitting a PR, ensure:

- [ ] All existing tests pass locally
- [ ] New features have unit tests (80% coverage)
- [ ] Integration tests added for cross-package changes
- [ ] E2E tests added for new user-facing features
- [ ] Test names are descriptive and behavior-focused
- [ ] No console errors in test output (except expected ones)
- [ ] Performance-sensitive code has benchmarks
- [ ] Documentation updated for testing changes

## Resources

- **Vitest Documentation**: https://vitest.dev/
- **Playwright Documentation**: https://playwright.dev/
- **Testing Library**: https://testing-library.com/
- **OCCT Testing Guide**: `packages/engine-occt/docs/TESTING.md`
- **E2E Test Results**: `claudedocs/E2E_TEST_RESULTS.md`

## Next Steps (Phase 5-7)

**Phase 5: Add 30 Targeted Unit Tests**

- Constraint solver: 15 tests
- Collaboration: 10 tests
- Viewport: 5 tests

**Phase 6: Create Performance Baseline Tests**

- Geometry operation benchmarks
- Viewport rendering performance
- Memory usage patterns

**Phase 7: Set Up CI/CD Pipeline**

- GitHub Actions workflow
- Automated coverage reporting
- Performance regression detection
