# Dependency Injection Test Examples

**Date**: 2025-11-16
**Purpose**: Comprehensive examples of dependency injection testing patterns
**Status**: Complete - Ready for use

---

## Overview

This document provides concrete, copy-paste examples of how to use the new dependency injection pattern for testing Sim4D's engine-occt components without complex Vitest mocking.

**Components Covered**:

1. IntegratedGeometryAPI (already implemented)
2. WorkerPool (newly implemented)
3. AdvancedMemoryManager (newly implemented)

---

## Example 1: IntegratedGeometryAPI Testing

**File**: `packages/engine-occt/src/integrated-geometry-api.test.ts`

### Before (Complex Mocking)

```typescript
// ❌ OLD APPROACH - Complex, fragile Vitest mocking
vi.mock('./occt-loader', async () => {
  const manualMock = await import('./__mocks__/occt-loader');
  manualMock.__setMockOCCTModule(occtFixture.occtModule);
  return manualMock;
});

beforeAll(async () => {
  const occtLoader = await import('./occt-loader');
  occtLoader.__setMockOCCTModule(occtFixture.occtModule);
});

afterEach(async () => {
  const occtLoader = await import('./occt-loader');
  occtLoader.__resetMockOCCTModule();
  occtLoader.__setMockOCCTModule(occtFixture.occtModule);
});
```

### After (Dependency Injection)

```typescript
// ✅ NEW APPROACH - Simple, explicit dependency injection

// Step 1: Create test fixture with mock OCCT module
const occtFixture = vi.hoisted(() => ({
  occtModule: {
    MAKE_BOX: vi.fn().mockReturnValue({ id: 'mock-box', type: 'Solid' }),
    MAKE_SPHERE: vi.fn().mockReturnValue({ id: 'mock-sphere', type: 'Solid' }),
    MAKE_CYLINDER: vi.fn().mockReturnValue({ id: 'mock-cylinder', type: 'Solid' }),
    // ... other OCCT operations
  },
  reset: () => {
    // Reset mock call counts
    Object.values(occtFixture.occtModule).forEach((fn) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        fn.mockClear();
      }
    });
  },
}));

// Step 2: Create test configuration with injected loader
const TEST_API_CONFIG: GeometryAPIConfig = {
  ...DEFAULT_API_CONFIG,
  // Inject mock OCCT loader directly via config
  occtLoader: async () => {
    console.log('[TEST] Mock OCCT loader called');
    return occtFixture.occtModule;
  },
};

// Step 3: Simple lifecycle hooks
afterEach(() => {
  occtFixture.reset();
});

// Step 4: Tests use TEST_API_CONFIG
describe('IntegratedGeometryAPI', () => {
  let geometryAPI: IntegratedGeometryAPI;

  beforeEach(async () => {
    geometryAPI = new IntegratedGeometryAPI(TEST_API_CONFIG);
    await geometryAPI.init();
  });

  it('should create a box using injected loader', async () => {
    const result = await geometryAPI.createBox({ width: 10, height: 10, depth: 10 });

    expect(result.success).toBe(true);
    expect(occtFixture.occtModule.MAKE_BOX).toHaveBeenCalledWith({
      width: 10,
      height: 10,
      depth: 10,
    });
  });
});
```

**Benefits**:

- No `vi.mock()` complexity
- Clear test setup
- Easy to debug
- Explicit dependencies

---

## Example 2: WorkerPool Testing

**File**: `packages/engine-occt/src/worker-pool.test.ts` (new/updated)

### Complete Test Setup

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkerPool, type PoolConfig, DEFAULT_POOL_CONFIG } from './worker-pool';
import type { WorkerClient } from './worker-client';

// Step 1: Create test fixture with mock worker client
const workerPoolFixture = vi.hoisted(() => ({
  mockWorkerClient: {
    init: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue({ success: true, result: 'mock-result' }),
    terminate: vi.fn().mockResolvedValue(undefined),
    isReady: true,
  },
  mockCapabilities: {
    hasWASM: true,
    hasSharedArrayBuffer: true,
    hasThreads: true,
    hasSimd: true,
  },
  mockOCCTConfig: {
    mode: 'full-occt' as const,
    wasmFile: 'occt.wasm',
    workers: 4,
    memory: '2GB',
    useThreads: true,
    enableSIMD: true,
  },
  performanceMeasurements: new Map<string, number>(),
  reset: () => {
    workerPoolFixture.mockWorkerClient.init.mockClear();
    workerPoolFixture.mockWorkerClient.invoke.mockClear();
    workerPoolFixture.mockWorkerClient.terminate.mockClear();
    workerPoolFixture.performanceMeasurements.clear();
  },
}));

// Step 2: Create test configuration with dependency injection
const TEST_WORKER_POOL_CONFIG: PoolConfig = {
  minWorkers: 2,
  maxWorkers: 4,
  idleTimeout: 60000,
  maxTasksPerWorker: 100,
  healthCheckInterval: 30000,
  memoryThreshold: 1024,
  enableCapabilityDetection: true,
  enablePerformanceMonitoring: true,
  enableCircuitBreaker: true,
  adaptiveScaling: false,
  taskTimeout: 30000,

  // DEPENDENCY INJECTION - No module mocking needed!
  workerFactory: (url, options) => {
    console.log('[TEST] Mock worker factory called with:', { url, options });
    return workerPoolFixture.mockWorkerClient as any as WorkerClient;
  },
  capabilityDetector: async () => {
    console.log('[TEST] Mock capability detector called');
    return workerPoolFixture.mockCapabilities;
  },
  configProvider: async () => {
    console.log('[TEST] Mock config provider called');
    return workerPoolFixture.mockOCCTConfig;
  },
  performanceMonitor: {
    startMeasurement: (name: string) => {
      const start = Date.now();
      workerPoolFixture.performanceMeasurements.set(name, start);
      return () => {
        const duration = Date.now() - start;
        console.log(`[TEST] Measurement ${name}: ${duration}ms`);
        return duration;
      };
    },
  },
};

describe('WorkerPool with Dependency Injection', () => {
  let pool: WorkerPool;

  beforeEach(() => {
    workerPoolFixture.reset();
  });

  afterEach(async () => {
    if (pool) {
      await pool.shutdown();
    }
  });

  it('should create workers using injected factory', async () => {
    pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stats = pool.getStats();
    expect(stats.totalWorkers).toBe(2); // minWorkers
    expect(workerPoolFixture.mockWorkerClient.init).toHaveBeenCalledTimes(2);
  });

  it('should execute operations using injected worker', async () => {
    pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.execute('MAKE_BOX', { width: 10, height: 10, depth: 10 });

    expect(result).toEqual({ success: true, result: 'mock-result' });
    expect(workerPoolFixture.mockWorkerClient.invoke).toHaveBeenCalledWith('MAKE_BOX', {
      width: 10,
      height: 10,
      depth: 10,
    });
  });

  it('should detect capabilities using injected detector', async () => {
    pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stats = pool.getStats();
    expect(stats.totalWorkers).toBeGreaterThan(0);

    // Verify injected capabilities were used
    // (can check console logs or add spy to verify)
  });

  it('should handle worker failures gracefully', async () => {
    // Override invoke to fail
    workerPoolFixture.mockWorkerClient.invoke.mockRejectedValueOnce(
      new Error('Worker operation failed')
    );

    pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);
    await new Promise((resolve) => setTimeout(resolve, 100));

    await expect(pool.execute('FAILING_OPERATION', { param: 'value' })).rejects.toThrow(
      'Worker operation failed'
    );
  });

  it('should measure performance using injected monitor', async () => {
    pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);
    await new Promise((resolve) => setTimeout(resolve, 100));

    await pool.execute('MEASURE_THIS', {});

    expect(workerPoolFixture.performanceMeasurements.has('operation-measure_this')).toBe(true);
  });
});
```

---

## Example 3: AdvancedMemoryManager Testing

**File**: `packages/engine-occt/src/memory-manager.test.ts` (new/updated)

### Complete Test Setup

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AdvancedMemoryManager,
  type MemoryConfig,
  DEFAULT_MEMORY_CONFIG,
  MemoryPressure,
} from './memory-manager';

// Step 1: Create test fixture with controllable time and memory
const memoryFixture = vi.hoisted(() => ({
  currentTime: 1000000, // Start at 1M ms
  currentMemory: {
    usedJSHeapSize: 100_000_000, // 100MB
    totalJSHeapSize: 200_000_000, // 200MB
  },
  performanceMeasurements: new Map<string, number>(),
  advanceTime: (ms: number) => {
    memoryFixture.currentTime += ms;
  },
  setMemoryUsage: (usedMB: number, totalMB: number) => {
    memoryFixture.currentMemory.usedJSHeapSize = usedMB * 1024 * 1024;
    memoryFixture.currentMemory.totalJSHeapSize = totalMB * 1024 * 1024;
  },
  reset: () => {
    memoryFixture.currentTime = 1000000;
    memoryFixture.currentMemory = {
      usedJSHeapSize: 100_000_000,
      totalJSHeapSize: 200_000_000,
    };
    memoryFixture.performanceMeasurements.clear();
  },
}));

// Step 2: Create test configuration with dependency injection
const TEST_MEMORY_CONFIG: MemoryConfig = {
  maxShapeCacheSize: 10,
  maxMeshCacheSize: 5,
  maxMemoryMB: 200,
  meshLODLevels: 3,
  cleanupThresholdMB: 150,
  aggressiveCleanupMB: 180,
  gcIntervalMs: 1000,

  // DEPENDENCY INJECTION - No mocking needed!
  performanceMonitor: {
    startMeasurement: (name: string) => {
      const start = memoryFixture.currentTime;
      memoryFixture.performanceMeasurements.set(name, start);
      return () => {
        const duration = memoryFixture.currentTime - start;
        console.log(`[TEST] Measurement ${name}: ${duration}ms`);
        return duration;
      };
    },
  },
  memoryProvider: {
    getMemoryStats: () => {
      console.log('[TEST] Memory stats requested:', memoryFixture.currentMemory);
      return memoryFixture.currentMemory;
    },
  },
  timeProvider: {
    now: () => {
      console.log('[TEST] Time requested:', memoryFixture.currentTime);
      return memoryFixture.currentTime;
    },
  },
};

describe('AdvancedMemoryManager with Dependency Injection', () => {
  let manager: AdvancedMemoryManager;

  beforeEach(() => {
    memoryFixture.reset();
    manager = new AdvancedMemoryManager(TEST_MEMORY_CONFIG);
  });

  afterEach(() => {
    if (manager) {
      manager.shutdown();
    }
  });

  it('should cache shapes with injected time provider', () => {
    const mockShape = { id: 'test-shape', type: 'Solid', data: {} };

    manager.cacheShape('shape-1', mockShape as any, 1);

    const retrieved = manager.getShape('shape-1');
    expect(retrieved).toEqual(mockShape);
  });

  it('should track access times using injected time', () => {
    const mockShape = { id: 'test-shape', type: 'Solid', data: {} };

    // Cache at time 1000000
    manager.cacheShape('shape-1', mockShape as any, 1);

    // Advance time
    memoryFixture.advanceTime(5000);

    // Access shape
    manager.getShape('shape-1');

    const stats = manager.getStats();
    expect(stats.shapeCount).toBe(1);
  });

  it('should evict old entries based on injected time', async () => {
    // Create multiple shapes
    for (let i = 0; i < 12; i++) {
      const mockShape = { id: `shape-${i}`, type: 'Solid', data: {} };
      manager.cacheShape(`shape-${i}`, mockShape as any, 1);

      // Advance time for each shape
      memoryFixture.advanceTime(1000);
    }

    const stats = manager.getStats();
    // Should have evicted some due to maxShapeCacheSize: 10
    expect(stats.shapeCount).toBeLessThanOrEqual(10);
  });

  it('should detect memory pressure using injected memory provider', () => {
    // Set high memory usage (180MB / 200MB = 90%)
    memoryFixture.setMemoryUsage(180, 200);

    // Force memory stats update
    manager['updateMemoryStats']();
    manager['updateMemoryPressure']();

    const pressure = manager.getMemoryPressure();
    expect(pressure).toBe(MemoryPressure.CRITICAL);
  });

  it('should measure cache operations with injected performance monitor', () => {
    const mockShape = { id: 'test-shape', type: 'Solid', data: {} };

    manager.cacheShape('shape-1', mockShape as any, 1);

    expect(memoryFixture.performanceMeasurements.has('cache-shape-store')).toBe(true);
  });

  it('should handle result caching with time-based expiration', () => {
    const mockResult = { success: true, value: 42 };

    // Cache result
    manager.cacheResult('operation-key', mockResult, 1);

    // Should be retrievable immediately
    expect(manager.getResult('operation-key')).toEqual(mockResult);

    // Advance time past cleanup threshold
    memoryFixture.advanceTime(700_000); // 700 seconds

    // Trigger cleanup
    manager['cleanResultCache'](600_000); // 10 minute threshold

    // Should be evicted
    expect(manager.getResult('operation-key')).toBeNull();
  });

  it('should use pinned entries to prevent eviction', () => {
    const pinnedShape = { id: 'pinned', type: 'Solid', data: {} };
    const regularShape = { id: 'regular', type: 'Solid', data: {} };

    // Cache with high priority (≥10 = pinned)
    manager.cacheShape('pinned', pinnedShape as any, 10);
    manager.cacheShape('regular', regularShape as any, 1);

    // Fill cache to trigger eviction
    for (let i = 0; i < 15; i++) {
      manager.cacheShape(`temp-${i}`, { id: `temp-${i}`, type: 'Solid' } as any, 1);
    }

    // Pinned should still exist
    expect(manager.getShape('pinned')).toEqual(pinnedShape);

    // Regular might be evicted
    // (depends on LRU algorithm, but pinned definitely safe)
  });
});
```

---

## Example 4: Combined Integration Test

**File**: `packages/engine-occt/src/integrated-system.test.ts` (new)

### Testing All Components Together

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegratedGeometryAPI, type GeometryAPIConfig } from './integrated-geometry-api';
import { DEFAULT_API_CONFIG } from './integrated-geometry-api';

// Combined fixture for full system testing
const systemFixture = vi.hoisted(() => ({
  // OCCT Module Mock
  occtModule: {
    MAKE_BOX: vi.fn().mockReturnValue({ id: 'box-1', type: 'Solid' }),
    MAKE_SPHERE: vi.fn().mockReturnValue({ id: 'sphere-1', type: 'Solid' }),
  },

  // Worker Mock
  mockWorker: {
    init: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockImplementation(async (op, params) => {
      if (systemFixture.occtModule[op]) {
        return systemFixture.occtModule[op](params);
      }
      throw new Error(`Unknown operation: ${op}`);
    }),
    terminate: vi.fn().mockResolvedValue(undefined),
  },

  // Capabilities Mock
  capabilities: {
    hasWASM: true,
    hasSharedArrayBuffer: true,
    hasThreads: true,
    hasSimd: true,
  },

  // OCCT Config Mock
  occtConfig: {
    mode: 'full-occt' as const,
    wasmFile: 'occt.wasm',
    workers: 4,
    memory: '2GB',
    useThreads: true,
    enableSIMD: true,
  },

  // Time & Memory Control
  currentTime: 1000000,
  currentMemory: {
    usedJSHeapSize: 100_000_000,
    totalJSHeapSize: 200_000_000,
  },

  reset: () => {
    Object.values(systemFixture.occtModule).forEach((fn) => fn.mockClear());
    systemFixture.mockWorker.init.mockClear();
    systemFixture.mockWorker.invoke.mockClear();
    systemFixture.currentTime = 1000000;
  },
}));

// Full system test configuration
const SYSTEM_TEST_CONFIG: GeometryAPIConfig = {
  ...DEFAULT_API_CONFIG,
  enableMemoryManagement: true,
  enableErrorRecovery: true,

  // Inject OCCT loader
  occtLoader: async () => systemFixture.occtModule,

  // Inject worker pool config with DI
  workerPoolConfig: {
    minWorkers: 1,
    maxWorkers: 2,
    idleTimeout: 60000,
    maxTasksPerWorker: 100,
    healthCheckInterval: 30000,
    memoryThreshold: 1024,
    enableCapabilityDetection: true,
    enablePerformanceMonitoring: true,
    enableCircuitBreaker: false,
    adaptiveScaling: false,
    taskTimeout: 30000,

    workerFactory: () => systemFixture.mockWorker as any,
    capabilityDetector: async () => systemFixture.capabilities,
    configProvider: async () => systemFixture.occtConfig,
  },

  // Inject memory config with DI
  memoryConfig: {
    maxShapeCacheSize: 100,
    maxMeshCacheSize: 50,
    maxMemoryMB: 200,
    meshLODLevels: 3,
    cleanupThresholdMB: 150,
    aggressiveCleanupMB: 180,
    gcIntervalMs: 10000,

    memoryProvider: {
      getMemoryStats: () => systemFixture.currentMemory,
    },
    timeProvider: {
      now: () => systemFixture.currentTime,
    },
  },
};

describe('Integrated System with Full Dependency Injection', () => {
  let api: IntegratedGeometryAPI;

  beforeEach(async () => {
    systemFixture.reset();
    api = new IntegratedGeometryAPI(SYSTEM_TEST_CONFIG);
    await api.init();
  });

  it('should create geometry using all injected dependencies', async () => {
    const result = await api.createBox({ width: 10, height: 20, depth: 30 });

    expect(result.success).toBe(true);
    expect(systemFixture.occtModule.MAKE_BOX).toHaveBeenCalledWith({
      width: 10,
      height: 20,
      depth: 30,
    });
  });

  it('should cache shapes in injected memory manager', async () => {
    await api.createBox({ width: 10, height: 10, depth: 10 });
    await api.createSphere({ radius: 5 });

    // Memory manager should have cached these operations
    const stats = api['memoryManager']?.getStats();
    expect(stats).toBeDefined();
  });

  it('should route operations through injected worker pool', async () => {
    await api.createBox({ width: 5, height: 5, depth: 5 });

    expect(systemFixture.mockWorker.invoke).toHaveBeenCalled();
  });
});
```

---

## Key Patterns & Best Practices

### 1. Fixture Creation Pattern

```typescript
const fixture = vi.hoisted(() => ({
  // Mock data
  mockData: {},

  // Mock functions
  mockFn: vi.fn(),

  // Control variables (time, memory, etc.)
  currentTime: 1000000,

  // Helper functions
  reset: () => {
    // Reset mocks and state
  },
  advanceTime: (ms: number) => {
    fixture.currentTime += ms;
  },
}));
```

**Why `vi.hoisted()`?**

- Ensures fixture created before module imports
- Prevents hoisting issues
- Clear separation of concerns

### 2. Config Creation Pattern

```typescript
const TEST_CONFIG: ComponentConfig = {
  ...DEFAULT_CONFIG,

  // Inject dependencies as functions
  dependency1: () => fixture.mockData,
  dependency2: async () => fixture.asyncMock,
  dependency3: {
    method: (arg) => fixture.mockFn(arg),
  },
};
```

**Benefits**:

- Type-safe
- Clear injection points
- Easy to override per-test

### 3. Lifecycle Hook Pattern

```typescript
beforeEach(() => {
  fixture.reset(); // Clean state
  component = new Component(TEST_CONFIG); // Fresh instance
});

afterEach(() => {
  if (component) {
    component.shutdown(); // Cleanup
  }
});
```

**Why this pattern?**

- Isolated tests
- No state leakage
- Predictable behavior

### 4. Time Control Pattern

```typescript
// In fixture
const fixture = vi.hoisted(() => ({
  currentTime: 1000000,
  advanceTime: (ms: number) => {
    fixture.currentTime += ms;
  },
}));

// In config
timeProvider: {
  now: () => fixture.currentTime;
}

// In test
it('should expire after 5 minutes', () => {
  manager.cacheItem('key', 'value');

  fixture.advanceTime(5 * 60 * 1000); // 5 minutes

  expect(manager.getItem('key')).toBeNull();
});
```

**Benefits**:

- Deterministic tests
- Fast execution
- Easy to test time-based logic

---

## Migration Checklist

When converting a test to use dependency injection:

- [ ] Remove `vi.mock()` calls for the module
- [ ] Create test fixture with `vi.hoisted()`
- [ ] Add reset() function to fixture
- [ ] Create TEST_CONFIG with injected dependencies
- [ ] Update component instantiation to use TEST_CONFIG
- [ ] Simplify lifecycle hooks (remove complex mock setup)
- [ ] Update assertions to use fixture mocks
- [ ] Verify tests still pass
- [ ] Remove manual mock files if they exist

---

## Troubleshooting

### Issue: Injected dependency not being called

**Symptoms**:

- Mock function shows 0 calls
- Real implementation being used instead

**Solution**:

```typescript
// Check config is passed correctly
console.log('[DEBUG] Config:', config);
console.log('[DEBUG] Has custom loader:', !!config.customLoader);

// Verify injection in constructor
constructor(config: Config) {
  this.dependency = config.dependency || defaultDependency;
  console.log('[DEBUG] Using dependency:', this.dependency);
}
```

### Issue: Time-based tests flaky

**Symptoms**:

- Tests sometimes pass, sometimes fail
- Different behavior on different machines

**Solution**:

```typescript
// Use injected time provider
timeProvider: {
  now: () => fixture.currentTime; // Deterministic
}

// Instead of
now: () => Date.now(); // Non-deterministic
```

### Issue: Type errors with mock functions

**Symptoms**:

- TypeScript errors on mock assignments
- "Type 'Mock' not assignable" errors

**Solution**:

```typescript
// Use type assertion
workerFactory: () => mockWorker as any as WorkerClient;

// Or update type definition
interface TestConfig extends Config {
  workerFactory?: () => WorkerClient | MockWorkerClient;
}
```

---

## Summary

**Before Dependency Injection**:

- ❌ Complex `vi.mock()` setup
- ❌ Fragile module mocking
- ❌ Hard to debug
- ❌ Framework-specific
- ❌ Timing-sensitive

**After Dependency Injection**:

- ✅ Simple, explicit injection
- ✅ Clear test setup
- ✅ Easy to debug
- ✅ Framework-agnostic
- ✅ Deterministic
- ✅ Type-safe
- ✅ Maintainable

**Result**: Tests that are clearer, more reliable, and easier to maintain!

---

**Document Status**: Complete
**Last Updated**: 2025-11-16
**Ready for Use**: ✅ Yes
