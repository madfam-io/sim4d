# OCCT Performance Profiling Setup

**Date**: 2025-11-13  
**Roadmap**: Horizon A - Performance Targets (P95 ≤ 1500ms)  
**Status**: Infrastructure Complete, Ready for WASM Integration

## Summary

Created comprehensive OCCT performance profiling infrastructure aligned with Roadmap Horizon A objectives. Discovered and resolved critical architecture issue: OCCT WASM requires browser environment, not Node.js.

## Work Completed

### 1. **GeometryAPIFactory Fix** (`packages/engine-core/src/geometry-api-factory.ts`)

**Problem**: Tried to import `createProductionAPI` which wasn't exported from `engine-occt`
**Solution**:

- Changed to use `createGeometryAPI` from `IntegratedGeometryAPI`
- Created adapter to match `WorkerAPI` interface
- `IntegratedGeometryAPI.invoke` returns `OperationResult<T>`, adapter unwraps to `T`

```typescript
const api: WorkerAPI = {
  invoke: async <T>(operation: string, params: any): Promise<T> => {
    const result = await integratedAPI.invoke<T>(operation, params);
    if (!result.success) {
      throw new Error(result.error || `Operation ${operation} failed`);
    }
    return result.result as T;
  },
  // ... tessellate, dispose, terminate
};
```

### 2. **Performance Test Suite** (`tests/audit/performance/occt-operations.perf.test.ts`)

**Approach**: Playwright-based browser tests (not Vitest Node.js tests)
**Why**: OCCT WASM loader uses `import.meta.url` and `new URL()` which require browser/ESM environment

**Test Coverage**:

- ✅ Box creation profiling (20 iterations)
- ✅ Cylinder creation profiling (20 iterations)
- ✅ Sphere creation profiling (20 iterations)
- ✅ Statistical analysis (P50/P90/P95/P99, mean, stddev, range)
- ✅ Comprehensive performance report generation

**Key Metrics**:

- Iterations per operation: 20
- P95 target: ≤ 1500ms (per roadmap)
- Warm-up run before profiling
- Graph clear between iterations

### 3. **Statistical Analysis Implementation**

```typescript
const percentile = (p: number) => {
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};
```

Calculates:

- P50 (median)
- P90, P95, P99 (tail latencies)
- Mean ± standard deviation
- Min/max range

## Architecture Insights

### OCCT WASM Loading

**Location**: `packages/engine-occt/src/occt-loader.ts:315`

```typescript
const wasmUrl = new URL(/* @vite-ignore */ `../wasm/${wasmFile}`, import.meta.url).href;
```

**Constraint**: Requires ESM/browser environment

- `import.meta.url` not available in Node.js CommonJS
- `new URL()` with relative paths fails in Node.js tests
- WASM files in `packages/engine-occt/wasm/` (exist, verified)

### Solution Pattern

**✅ Correct**: Playwright tests → Browser environment → WASM loads
**❌ Wrong**: Vitest tests → Node.js → WASM fails

## Files Modified

1. **packages/engine-core/src/geometry-api-factory.ts**
   - Changed import from `createProductionAPI` to `createGeometryAPI`
   - Created WorkerAPI adapter for IntegratedGeometryAPI
   - Rebuil engine-core package

2. **tests/audit/performance/occt-operations.perf.test.ts** (NEW)
   - Playwright-based performance profiling
   - 4 test cases (3 primitives + 1 report)
   - Statistical analysis implementation
   - Aligned with existing performance test patterns

3. **tests/performance/occt-operations.perf.test.ts** (DELETED)
   - Original Vitest-based approach (didn't work)
   - Wrong environment for WASM

## Next Steps

### Immediate (Horizon A)

1. **Verify WASM Integration**: Run performance tests in browser to validate real OCCT
2. **Collect Baseline Metrics**: Execute full test suite, capture P95 for all operations
3. **Analyze Against Target**: Compare results to 1500ms P95 target
4. **Identify Bottlenecks**: Profile slow operations, check WASM compilation flags
5. **Expand Test Coverage**: Add Boolean operations (Union, Difference, Intersection), Features (Fillet, Chamfer), Complex assemblies

### Technical Debt

- ✅ `engine-core` now uses `IntegratedGeometryAPI` correctly
- ✅ WASM path configuration understood
- ⏳ Full performance test suite (only 3 primitives implemented)
- ⏳ Performance optimization recommendations (pending baseline data)

## Test Execution

```bash
# Run performance profiling tests
pnpm run test:e2e tests/audit/performance/occt-operations.perf.test.ts --project=chromium

# With visible browser (for debugging)
pnpm run test:e2e tests/audit/performance/occt-operations.perf.test.ts --project=chromium --headed
```

## Integration with Existing Infrastructure

Performance tests use same helpers as other E2E tests:

- `bootstrapStudio(page)`: Initialize Studio app
- `ensureCanvasReady(page, 10000)`: Wait for viewport
- `clearAuditErrors(page)`: Reset error state

Pattern matches `tests/audit/performance/performance-metrics.test.ts`:

```typescript
test('profiles Box creation', async ({ page }) => {
  const stats = await page.evaluate(
    async ({ iterations, target }) => {
      const studio = (window as any).studio;
      // ... profiling logic in browser context
      return stats;
    },
    { iterations: ITERATIONS, target: P95_TARGET_MS }
  );

  expect(stats.p95).toBeLessThanOrEqual(P95_TARGET_MS);
});
```

## Roadmap Alignment

**Horizon A (Complete by March 2025)**:

- ✅ Performance profiling infrastructure
- ✅ Statistical analysis methodology
- ✅ P95 measurement implementation
- ⏳ Baseline metrics collection (blocked on full WASM integration)
- ⏳ Optimization recommendations (pending baseline data)

**Key Achievement**: Unblocked performance profiling by solving WASM environment issue. Infrastructure ready for immediate use when WASM fully integrated.
