# Dependency Injection Pattern Extension Plan

**Date**: 2025-11-16
**Status**: Design Phase
**Author**: Claude (AI Assistant)
**Context**: Extending DI pattern from IntegratedGeometryAPI to other testable components

---

## Executive Summary

Based on analysis of `IntegratedGeometryAPI` successful DI implementation, this plan extends the pattern to three additional components:

1. **WorkerPool** - Worker creation and management
2. **AdvancedMemoryManager** - Cache management and memory monitoring
3. **ErrorRecoverySystem** - Validation and recovery strategies

**Goal**: Make all core components testable via dependency injection, eliminating complex Vitest mocking.

---

## Component Analysis

### 1. WorkerPool (`src/worker-pool.ts`)

**Current Architecture**:

- Creates workers via `WorkerClient` class instantiation (line 116)
- Calls `WASMCapabilityDetector.detectCapabilities()` (line 77)
- Calls `WASMCapabilityDetector.getOptimalConfiguration()` (line 78)
- No injectable dependencies - hard-coded to real implementations

**Dependencies to Inject**:

```typescript
// Current problematic code:
const client = new WorkerClient(this.config.workerUrl, { ... });
this.globalCapabilities = await WASMCapabilityDetector.detectCapabilities();
this.optimalOCCTConfig = await WASMCapabilityDetector.getOptimalConfiguration();
```

**Injection Points Needed**:

1. **workerFactory**: `(url: string, options: any) => WorkerClient` - Create worker clients
2. **capabilityDetector**: `() => Promise<Capabilities>` - Detect WASM capabilities
3. **configProvider**: `() => Promise<OCCTConfig>` - Get optimal OCCT config

**Test Benefits**:

- Mock worker creation without actual Worker threads
- Control capability detection results
- Test different OCCT configurations without environment setup

### 2. AdvancedMemoryManager (`src/memory-manager.ts`)

**Current Architecture**:

- Calls `WASMPerformanceMonitor.startMeasurement()` (lines 91, 119, 144)
- Uses `performance.memory` for memory monitoring (implied)
- No injectable dependencies - hard-coded monitoring

**Dependencies to Inject**:

```typescript
// Current problematic code:
const endMeasurement = WASMPerformanceMonitor?.startMeasurement('cache-shape-store');
// ... later ...
if (endMeasurement) endMeasurement();
```

**Injection Points Needed**:

1. **performanceMonitor**: Performance measurement interface
   - `startMeasurement(name: string) => () => void`
2. **memoryProvider**: Memory stats provider
   - `getMemoryStats() => MemoryStats`
3. **timeProvider**: Time source (for cache aging)
   - `now() => number`

**Test Benefits**:

- Mock performance measurements without side effects
- Control memory pressure scenarios deterministically
- Fast-forward time for cache eviction tests

### 3. ErrorRecoverySystem (`src/error-recovery.ts`)

**Current Architecture**:

- Calls `WASMPerformanceMonitor.startMeasurement()` (line 107)
- Calls `getMemoryManager()` for memory state (line 6 import)
- Validation rules and recovery strategies are hardcoded

**Dependencies to Inject**:

```typescript
// Current problematic code:
const endMeasurement = WASMPerformanceMonitor?.startMeasurement('error-validation');
const memoryManager = getMemoryManager(); // Singleton access
```

**Injection Points Needed**:

1. **performanceMonitor**: Same as MemoryManager
2. **memoryStateProvider**: Get memory state
   - `getMemoryState() => MemoryState`
3. **validationRules**: Custom validation rules (optional override)
4. **recoveryStrategies**: Custom recovery strategies (optional override)

**Test Benefits**:

- Mock memory state for error scenarios
- Test custom validation rules
- Test recovery strategies in isolation
- Control performance monitoring

---

## Dependency Injection Design Pattern

### Configuration Interface Pattern

Following the pattern established in `IntegratedGeometryAPI`:

```typescript
export interface GeometryAPIConfig {
  enableRealOCCT: boolean;
  // ... other config ...

  // Dependency injection for testing - allows tests to provide mock OCCT loader
  occtLoader?: (config?: any) => Promise<any>;
}
```

We'll add optional dependency providers to each component's config:

### 1. WorkerPool Configuration Extension

```typescript
export interface PoolConfig {
  minWorkers: number;
  maxWorkers: number;
  // ... existing config ...

  // DEPENDENCY INJECTION for testing
  workerFactory?: (url: string, options: any) => WorkerClient;
  capabilityDetector?: () => Promise<Capabilities>;
  configProvider?: () => Promise<OCCTConfig>;
}

// Usage in WorkerPool constructor:
constructor(private config: PoolConfig) {
  // Use injected dependencies or defaults
  this.workerFactory = config.workerFactory || ((url, opts) => new WorkerClient(url, opts));
  this.capabilityDetector = config.capabilityDetector ||
    (() => WASMCapabilityDetector.detectCapabilities());
  this.configProvider = config.configProvider ||
    (() => WASMCapabilityDetector.getOptimalConfiguration());
}
```

### 2. MemoryConfig Extension

```typescript
export interface MemoryConfig {
  maxShapeCacheSize: number;
  // ... existing config ...

  // DEPENDENCY INJECTION for testing
  performanceMonitor?: {
    startMeasurement: (name: string) => (() => void) | undefined;
  };
  memoryProvider?: {
    getMemoryStats: () => MemoryStats;
  };
  timeProvider?: {
    now: () => number;
  };
}

// Usage in AdvancedMemoryManager:
constructor(private config: MemoryConfig) {
  this.performanceMonitor = config.performanceMonitor || WASMPerformanceMonitor;
  this.memoryProvider = config.memoryProvider || defaultMemoryProvider;
  this.timeProvider = config.timeProvider || { now: () => Date.now() };
}
```

### 3. ErrorRecoveryConfig (New Interface)

```typescript
export interface ErrorRecoveryConfig {
  // DEPENDENCY INJECTION for testing
  performanceMonitor?: {
    startMeasurement: (name: string) => (() => void) | undefined;
  };
  memoryStateProvider?: {
    getMemoryState: () => MemoryState;
  };
  validationRules?: ValidationRule[];
  recoveryStrategies?: RecoveryStrategy[];
}

// Modified constructor:
constructor(config: ErrorRecoveryConfig = {}) {
  this.performanceMonitor = config.performanceMonitor || WASMPerformanceMonitor;
  this.memoryStateProvider = config.memoryStateProvider || defaultMemoryProvider;

  // Initialize with defaults or injected rules/strategies
  this.initializeValidationRules(config.validationRules);
  this.initializeRecoveryStrategies(config.recoveryStrategies);
}
```

---

## Test Configuration Patterns

### WorkerPool Test Config

```typescript
// Test fixture with mock dependencies
const workerPoolFixture = vi.hoisted(() => ({
  mockWorkerClient: {
    init: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue({ success: true }),
    terminate: vi.fn().mockResolvedValue(undefined),
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
}));

// Test configuration with dependency injection
const TEST_WORKER_POOL_CONFIG: PoolConfig = {
  minWorkers: 2,
  maxWorkers: 4,
  // ... other config ...

  // Inject mock dependencies
  workerFactory: (url, options) => workerPoolFixture.mockWorkerClient as any,
  capabilityDetector: async () => workerPoolFixture.mockCapabilities,
  configProvider: async () => workerPoolFixture.mockOCCTConfig,
};

// Test usage - no module mocking needed!
it('should create workers with injected factory', async () => {
  const pool = new WorkerPool(TEST_WORKER_POOL_CONFIG);
  await pool.init(); // Uses mock worker factory

  expect(workerPoolFixture.mockWorkerClient.init).toHaveBeenCalled();
});
```

### MemoryManager Test Config

```typescript
const memoryFixture = vi.hoisted(() => ({
  measurements: new Map<string, number>(),
  currentMemory: { usedJSHeapSize: 100_000_000, totalJSHeapSize: 200_000_000 },
  currentTime: 1000000,
}));

const TEST_MEMORY_CONFIG: MemoryConfig = {
  maxShapeCacheSize: 10,
  // ... other config ...

  performanceMonitor: {
    startMeasurement: (name: string) => {
      const start = memoryFixture.currentTime;
      memoryFixture.measurements.set(name, start);
      return () => {
        const duration = memoryFixture.currentTime - start;
        console.log(`[TEST] Measurement ${name}: ${duration}ms`);
      };
    },
  },
  memoryProvider: {
    getMemoryStats: () => memoryFixture.currentMemory,
  },
  timeProvider: {
    now: () => memoryFixture.currentTime,
  },
};

it('should cache shapes with mock performance monitoring', () => {
  const manager = new AdvancedMemoryManager(TEST_MEMORY_CONFIG);
  const shape = { id: 'test-shape', data: {} };

  manager.cacheShape('shape-1', shape as any, 1);

  expect(memoryFixture.measurements.has('cache-shape-store')).toBe(true);
});
```

### ErrorRecovery Test Config

```typescript
const errorRecoveryFixture = vi.hoisted(() => ({
  mockMemoryState: {
    totalMemoryMB: 100,
    pressureLevel: 'low' as const,
  },
  mockPerformanceMonitor: {
    startMeasurement: vi.fn(() => vi.fn()),
  },
  customValidationRule: {
    name: 'test-validation',
    validate: vi.fn(() => ({ valid: true, errors: [], warnings: [] })),
    category: 'validation_error' as const,
    severity: 'medium' as const,
  },
}));

const TEST_ERROR_RECOVERY_CONFIG: ErrorRecoveryConfig = {
  performanceMonitor: errorRecoveryFixture.mockPerformanceMonitor,
  memoryStateProvider: {
    getMemoryState: () => errorRecoveryFixture.mockMemoryState,
  },
  validationRules: [errorRecoveryFixture.customValidationRule],
};

it('should validate with custom rules', async () => {
  const recovery = new ErrorRecoverySystem(TEST_ERROR_RECOVERY_CONFIG);

  const result = await recovery.validateOperation('test-op', {});

  expect(errorRecoveryFixture.customValidationRule.validate).toHaveBeenCalled();
});
```

---

## Integration with IntegratedGeometryAPI

### Updated GeometryAPIConfig

```typescript
export interface GeometryAPIConfig {
  enableRealOCCT: boolean;
  enablePerformanceMonitoring: boolean;
  enableMemoryManagement: boolean;
  enableErrorRecovery: boolean;

  // Existing DI
  occtLoader?: (config?: any) => Promise<any>;

  // NEW: DI for subsystems
  workerPoolConfig?: PoolConfig; // Now includes DI options
  memoryConfig?: MemoryConfig; // Now includes DI options
  errorRecoveryConfig?: ErrorRecoveryConfig; // New with DI options

  maxRetries: number;
  operationTimeout: number;
}
```

### Subsystem Initialization (lines 77-87)

```typescript
// Current code:
if (config.enableMemoryManagement) {
  this.memoryManager = getMemoryManager(config.memoryConfig);
}

if (config.enableErrorRecovery) {
  this.errorRecovery = getErrorRecoverySystem();
}

if (config.workerPoolConfig) {
  this.workerPool = getWorkerPool(config.workerPoolConfig);
}
```

**No changes needed!** - The config already passes through correctly. We just enhance the config interfaces.

---

## Implementation Roadmap

### Phase 1: WorkerPool DI ✅ Design Complete

1. ✅ Analyze WorkerPool dependencies
2. ⏳ Add DI fields to PoolConfig
3. ⏳ Update WorkerPool constructor to use injected dependencies
4. ⏳ Create test configuration with mocks
5. ⏳ Update WorkerPool tests to use DI pattern
6. ⏳ Verify test pass rate improvement

### Phase 2: MemoryManager DI

1. ✅ Analyze MemoryManager dependencies
2. ⏳ Add DI fields to MemoryConfig
3. ⏳ Update AdvancedMemoryManager constructor
4. ⏳ Create test configuration
5. ⏳ Update tests to use DI
6. ⏳ Verify caching tests work correctly

### Phase 3: ErrorRecovery DI

1. ✅ Analyze ErrorRecoverySystem dependencies
2. ⏳ Create ErrorRecoveryConfig interface
3. ⏳ Update constructor to accept config
4. ⏳ Implement default providers
5. ⏳ Create test configuration
6. ⏳ Update tests to use DI

### Phase 4: Integration Testing

1. ⏳ Update IntegratedGeometryAPI tests to inject subsystem mocks
2. ⏳ Test full system with all dependencies mocked
3. ⏳ Verify test isolation and independence
4. ⏳ Run full test suite

### Phase 5: Documentation

1. ⏳ Document DI pattern in each component
2. ⏳ Create testing guide with examples
3. ⏳ Add migration notes for future components
4. ⏳ Update architecture documentation

---

## Benefits Summary

### Before DI (Current State)

```typescript
// Complex Vitest mocking required
vi.mock('./wasm-capability-detector', () => ({ ... }));
vi.mock('./worker-client', () => ({ ... }));
vi.mock('./memory-manager', () => ({ ... }));

// Tests fragile, hard to debug, timing-sensitive
```

### After DI (Target State)

```typescript
// Simple, explicit dependency injection
const testConfig: PoolConfig = {
  ...DEFAULT_POOL_CONFIG,
  workerFactory: () => mockWorker,
  capabilityDetector: () => Promise.resolve(mockCaps),
};

const pool = new WorkerPool(testConfig);
// Tests clear, debuggable, reliable
```

**Advantages**:

- ✅ No module mocking complexity
- ✅ Clear, explicit test dependencies
- ✅ Easy to debug (no hidden mocks)
- ✅ Framework-agnostic (works with any test runner)
- ✅ Type-safe dependency injection
- ✅ Production code unchanged (backward compatible)
- ✅ Follows SOLID principles (Dependency Inversion)

---

## Risk Assessment

### Low Risk ✅

- **Backward Compatibility**: All DI fields optional, existing code works unchanged
- **Type Safety**: TypeScript validates all injection points
- **Test Coverage**: Can implement incrementally, keeping existing tests
- **Production Impact**: None - production uses default implementations

### Medium Risk ⚠️

- **Test Migration Effort**: Need to update existing tests to use DI pattern
- **Learning Curve**: Developers need to understand DI pattern
- **Coverage Gaps**: May discover untestable code during migration

### Mitigation Strategies

1. **Incremental Rollout**: One component at a time
2. **Parallel Testing**: Keep old tests until new tests proven
3. **Documentation**: Comprehensive examples and migration guide
4. **Code Reviews**: Ensure DI pattern applied correctly

---

## Success Criteria

1. **Test Pass Rate**: Maintain or improve current 75% (69/92 tests)
2. **Test Clarity**: Reduced test setup complexity (fewer vi.mock calls)
3. **Test Speed**: No performance regression in test execution
4. **Maintainability**: New developers can understand test setup
5. **Flexibility**: Easy to test edge cases and error scenarios
6. **Production Safety**: Zero impact on production code behavior

---

## Next Steps

1. **Immediate**: Implement Phase 1 (WorkerPool DI)
2. **Short-term**: Complete Phases 2-3 (MemoryManager, ErrorRecovery)
3. **Medium-term**: Full integration testing and documentation
4. **Long-term**: Apply pattern to other components as needed

---

**Document Status**: Design Complete, Ready for Implementation
**Last Updated**: 2025-11-16
**Next Review**: After Phase 1 completion
