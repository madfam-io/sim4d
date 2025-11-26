# Dependency Injection Best Practices for Sim4D

**Date**: 2025-11-16
**Purpose**: Guidelines for implementing and using dependency injection
**Status**: Complete

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [When to Use DI](#when-to-use-di)
3. [Implementation Guide](#implementation-guide)
4. [Testing Patterns](#testing-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Performance Considerations](#performance-considerations)
7. [Migration Strategy](#migration-strategy)

---

## Core Principles

### 1. Dependency Inversion Principle (SOLID)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."

**In Practice**:

```typescript
// ❌ BAD: Direct dependency on concrete implementation
class WorkerPool {
  async createWorker() {
    const client = new WorkerClient(url, options); // Hard-coded dependency
  }
}

// ✅ GOOD: Dependency on abstraction via configuration
class WorkerPool {
  constructor(private config: PoolConfig) {
    this.workerFactory = config.workerFactory || ((url, opts) => new WorkerClient(url, opts));
  }

  async createWorker() {
    const client = this.workerFactory(url, options); // Injected dependency
  }
}
```

### 2. Optional Injection

**Always make dependencies optional** - production code should work without explicit injection:

```typescript
interface ComponentConfig {
  // Required config
  maxSize: number;

  // OPTIONAL dependency injection (for testing)
  dependency?: () => Promise<Dependency>;
}

class Component {
  private readonly dependency: () => Promise<Dependency>;

  constructor(config: ComponentConfig) {
    // Use injected OR default
    this.dependency = config.dependency || defaultDependency;
  }
}
```

**Why?**

- Backward compatible
- Production code unchanged
- Tests opt-in to DI

### 3. Interface-Based Injection

Define clear interfaces for injectable dependencies:

```typescript
// ✅ GOOD: Clear interface
interface PerformanceMonitor {
  startMeasurement: (name: string) => (() => number) | undefined;
}

interface ComponentConfig {
  performanceMonitor?: PerformanceMonitor;
}

// ❌ BAD: Any type
interface ComponentConfig {
  performanceMonitor?: any; // Loses type safety!
}
```

---

## When to Use DI

### ✅ Use Dependency Injection When:

1. **Testing External Dependencies**
   - File system operations
   - Network calls
   - Worker threads
   - WASM modules
   - Browser APIs (performance, memory)

2. **Isolating Time-Dependent Logic**
   - Cache expiration
   - Timeout handling
   - Rate limiting
   - Scheduling

3. **Mocking Complex Subsystems**
   - Geometry kernel (OCCT)
   - Worker pools
   - Memory managers
   - Performance monitors

4. **Enabling Test Determinism**
   - Random number generation
   - UUID generation
   - Timestamp creation

### ❌ Don't Use DI When:

1. **Simple Pure Functions**

   ```typescript
   // No DI needed - pure function
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

2. **Internal Implementation Details**

   ```typescript
   // Don't inject every helper function
   class Component {
     private helperMethod() {
       // Internal logic - no DI needed
     }
   }
   ```

3. **Standard Library Usage**
   ```typescript
   // Don't inject Math, Array, String methods
   const rounded = Math.round(value); // OK
   ```

---

## Implementation Guide

### Step 1: Identify Injectable Dependencies

Ask these questions:

1. Does this make external calls? (Network, File, Worker, WASM)
2. Does this use global state? (Date, performance, window)
3. Will tests need to control this behavior?
4. Is this behavior environment-dependent?

If **YES** to any → Consider DI

### Step 2: Design Config Interface

```typescript
export interface ComponentConfig {
  // Step 2a: Required config options
  option1: string;
  option2: number;

  // Step 2b: DEPENDENCY INJECTION (always optional and commented)
  // Allows tests to provide mock dependency
  dependency?: (arg: string) => Promise<Result>;

  // Complex dependencies use interface shape
  performanceMonitor?: {
    startMeasurement: (name: string) => (() => number) | undefined;
  };
}
```

### Step 3: Store Dependencies in Class

```typescript
export class Component {
  // Step 3a: Declare readonly private fields
  private readonly dependency: (arg: string) => Promise<Result>;
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(private config: ComponentConfig) {
    // Step 3b: Initialize with injected OR default
    this.dependency = config.dependency || defaultImplementation;
    this.performanceMonitor = config.performanceMonitor || DefaultMonitor;

    // Step 3c: Optional debug logging
    console.log('[Component] Initialized with config:', {
      hasCustomDependency: !!config.dependency,
      hasCustomMonitor: !!config.performanceMonitor,
    });
  }
}
```

### Step 4: Use Injected Dependencies

```typescript
class Component {
  async performOperation(arg: string) {
    // Step 4a: Use injected dependency (NOT original import)
    const result = await this.dependency(arg); // ✅ Uses injected

    // Step 4b: DON'T use original import directly
    // const result = await originalFunction(arg);  // ❌ Bypasses injection

    return result;
  }
}
```

### Step 5: Create Test Configuration

```typescript
// Step 5a: Create fixture
const fixture = vi.hoisted(() => ({
  mockResult: { success: true },
  mockDependency: vi.fn().mockResolvedValue({ success: true }),
  reset: () => {
    fixture.mockDependency.mockClear();
  },
}));

// Step 5b: Create test config
const TEST_CONFIG: ComponentConfig = {
  option1: 'test',
  option2: 42,

  // Inject mock dependency
  dependency: async (arg) => {
    console.log('[TEST] Mock dependency called with:', arg);
    return fixture.mockResult;
  },
};

// Step 5c: Use in tests
it('should use injected dependency', async () => {
  const component = new Component(TEST_CONFIG);
  await component.performOperation('test-arg');

  // Verify mock was called (not real implementation)
  expect(fixture.mockDependency).toHaveBeenCalledWith('test-arg');
});
```

---

## Testing Patterns

### Pattern 1: Simple Function Injection

**Use when**: Single function dependency

```typescript
interface Config {
  loader?: (id: string) => Promise<Data>;
}

const TEST_CONFIG: Config = {
  loader: async (id) => mockData,
};
```

### Pattern 2: Object with Methods

**Use when**: Multiple related methods

```typescript
interface Config {
  monitor?: {
    start: (name: string) => () => void;
    stop: (name: string) => void;
  };
}

const TEST_CONFIG: Config = {
  monitor: {
    start: (name) => {
      startTimes.set(name, Date.now());
      return () => {
        /* cleanup */
      };
    },
    stop: (name) => {
      /* stop logic */
    },
  },
};
```

### Pattern 3: Controlled State

**Use when**: Need to control time, memory, or other state

```typescript
const fixture = vi.hoisted(() => ({
  currentTime: 1000000,
  advanceTime: (ms: number) => {
    fixture.currentTime += ms;
  },
}));

const TEST_CONFIG: Config = {
  timeProvider: {
    now: () => fixture.currentTime,
  },
};

// In test
fixture.advanceTime(5000); // Control time progression
```

### Pattern 4: Factory Injection

**Use when**: Need to create multiple instances

```typescript
interface Config {
  workerFactory?: (url: string, opts: any) => Worker;
}

const TEST_CONFIG: Config = {
  workerFactory: (url, opts) => {
    console.log('[TEST] Creating worker:', { url, opts });
    return mockWorker;
  },
};
```

---

## Common Pitfalls

### Pitfall 1: Forgetting to Use Injected Dependency

```typescript
class Component {
  private readonly dependency: Dependency;

  constructor(config: Config) {
    this.dependency = config.dependency || defaultDependency;
  }

  async operation() {
    // ❌ WRONG: Using original import
    const result = await originalDependency();

    // ✅ CORRECT: Using injected dependency
    const result = await this.dependency();
  }
}
```

**Solution**: Search for direct usage of dependency after implementing DI

### Pitfall 2: Mutable Fixture State

```typescript
// ❌ BAD: Mutable state without reset
const fixture = vi.hoisted(() => ({
  counter: 0,
  // Missing reset function!
}));

// ✅ GOOD: Always include reset
const fixture = vi.hoisted(() => ({
  counter: 0,
  reset: () => {
    fixture.counter = 0;
  },
}));

beforeEach(() => {
  fixture.reset(); // Clean state for each test
});
```

### Pitfall 3: Type Assertion Overuse

```typescript
// ❌ BAD: Losing type safety
workerFactory: () => mockWorker as any;

// ✅ BETTER: Proper type assertion
workerFactory: () => mockWorker as any as WorkerClient;

// ✅ BEST: Make mock conform to interface
const mockWorker: WorkerClient = {
  init: vi.fn(),
  invoke: vi.fn(),
  terminate: vi.fn(),
};
```

### Pitfall 4: Not Logging Injection

```typescript
// ❌ BAD: Silent injection - hard to debug
constructor(config: Config) {
  this.dependency = config.dependency || defaultDependency;
}

// ✅ GOOD: Log what's being used
constructor(config: Config) {
  this.dependency = config.dependency || defaultDependency;
  console.log('[Component] Using dependency:',
    config.dependency ? 'INJECTED' : 'DEFAULT');
}
```

### Pitfall 5: Testing with Production Config

```typescript
// ❌ BAD: Using production config in tests
const api = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);

// ✅ GOOD: Using test config with DI
const api = new IntegratedGeometryAPI(TEST_API_CONFIG);
```

---

## Performance Considerations

### 1. Injection Overhead

**Concern**: Does DI slow down production code?

**Answer**: No - minimal overhead

```typescript
// Production: One extra null check
this.dependency = config.dependency || defaultDependency;
// Cost: ~1 nanosecond

// Then used normally
await this.dependency(); // No extra cost
```

### 2. Test Execution Speed

**Before DI** (with mocking):

```
Test Suite: 15 seconds
  - Module mocking setup: 5s
  - Test execution: 10s
```

**After DI**:

```
Test Suite: 8 seconds
  - No mocking setup: 0s
  - Test execution: 8s
  - Improvement: 47% faster
```

### 3. Memory Usage

DI adds one extra object reference per injectable dependency:

```typescript
// Extra memory: ~8 bytes per reference
private readonly dependency: Function;  // 8 bytes
```

**Impact**: Negligible (< 1KB per component)

---

## Migration Strategy

### Phase 1: Identify Candidates

1. Find components with complex mocking:

   ```bash
   grep -r "vi.mock" packages/engine-occt/src/**/*.test.ts
   ```

2. Prioritize by pain points:
   - Most fragile tests
   - Most complex mocking
   - Highest failure rate

### Phase 2: Implement DI

1. Add DI to config interface
2. Update component constructor
3. Replace direct usage with injected
4. Add debug logging

### Phase 3: Update Tests

1. Create test fixture
2. Build test config
3. Simplify lifecycle hooks
4. Remove `vi.mock()` calls
5. Update assertions

### Phase 4: Validate

1. Run tests - ensure passing
2. Check coverage - maintain levels
3. Review performance - should improve
4. Update documentation

### Phase 5: Cleanup

1. Delete manual mock files
2. Remove unused imports
3. Update related tests
4. Document pattern for team

---

## Decision Matrix

Use this to decide DI vs Mocking:

| Scenario           | Use DI | Use Mocking | Why                              |
| ------------------ | ------ | ----------- | -------------------------------- |
| External API calls | ✅     |             | Better control, no timing issues |
| File operations    | ✅     |             | Avoid real FS operations         |
| Worker threads     | ✅     |             | Hard to mock with vi.mock()      |
| WASM modules       | ✅     |             | Complex initialization           |
| Time-based logic   | ✅     |             | Deterministic tests              |
| Pure functions     |        | ✅          | Simple spy, no DI needed         |
| Internal methods   |        |             | No mocking needed                |
| Simple helpers     |        | ✅          | vi.fn() sufficient               |

---

## Checklist for New Components

When creating a new testable component:

- [ ] Identify external dependencies
- [ ] Define config interface with optional DI fields
- [ ] Add comments explaining each injectable dependency
- [ ] Store injected dependencies as readonly private fields
- [ ] Initialize with `config.X || defaultX` pattern
- [ ] Add debug logging for injection status
- [ ] Use injected dependencies (not original imports)
- [ ] Create test fixture with reset function
- [ ] Build test config with injected mocks
- [ ] Write tests using test config
- [ ] Document DI pattern in component file
- [ ] Add example to test examples doc

---

## Real-World Example: Complete Workflow

### Step 1: Identify Need

```typescript
// Current test - fragile mocking
vi.mock('./worker-client', () => ({
  WorkerClient: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    invoke: vi.fn(),
  })),
}));
```

**Problem**: Module mocking is fragile, timing-sensitive

### Step 2: Design DI Interface

```typescript
export interface PoolConfig {
  minWorkers: number;
  maxWorkers: number;

  // DEPENDENCY INJECTION for testing
  workerFactory?: (url: string | undefined, options: any) => WorkerClient;
}
```

### Step 3: Implement in Component

```typescript
export class WorkerPool {
  private readonly workerFactory: (url: string | undefined, options: any) => WorkerClient;

  constructor(private config: PoolConfig) {
    this.workerFactory = config.workerFactory || ((url, options) => new WorkerClient(url, options));

    console.log(
      '[WorkerPool] Using worker factory:',
      config.workerFactory ? 'INJECTED' : 'DEFAULT'
    );
  }

  private async createWorker(): Promise<PoolWorker> {
    const client = this.workerFactory(this.config.workerUrl, options);
    await client.init();
    return { id, client /* ... */ };
  }
}
```

### Step 4: Create Test Setup

```typescript
const fixture = vi.hoisted(() => ({
  mockClient: {
    init: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue({ success: true }),
    terminate: vi.fn().mockResolvedValue(undefined),
  },
  reset: () => {
    fixture.mockClient.init.mockClear();
    fixture.mockClient.invoke.mockClear();
    fixture.mockClient.terminate.mockClear();
  },
}));

const TEST_CONFIG: PoolConfig = {
  minWorkers: 2,
  maxWorkers: 4,
  workerFactory: (url, options) => {
    console.log('[TEST] Creating mock worker');
    return fixture.mockClient as any as WorkerClient;
  },
};
```

### Step 5: Write Tests

```typescript
describe('WorkerPool with DI', () => {
  let pool: WorkerPool;

  beforeEach(() => {
    fixture.reset();
  });

  afterEach(async () => {
    if (pool) await pool.shutdown();
  });

  it('should create workers using injected factory', async () => {
    pool = new WorkerPool(TEST_CONFIG);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(fixture.mockClient.init).toHaveBeenCalledTimes(2);
  });
});
```

### Step 6: Remove Old Mocking

```diff
- vi.mock('./worker-client', () => ({
-   WorkerClient: vi.fn().mockImplementation(() => ({
-     init: vi.fn(),
-     invoke: vi.fn(),
-   })),
- }));

// Now using DI - no mocking needed!
```

---

## Summary

**Dependency Injection Benefits**:

- ✅ Simpler, clearer tests
- ✅ Better type safety
- ✅ Framework-agnostic
- ✅ Easier to debug
- ✅ More maintainable
- ✅ Faster test execution
- ✅ Deterministic behavior

**When to Use**:

- External dependencies
- Time-based logic
- Complex subsystems
- Test isolation needs

**When NOT to Use**:

- Pure functions
- Simple helpers
- Internal implementation

**Result**: Tests that are reliable, maintainable, and easy to understand!

---

**Document Status**: Complete
**Last Updated**: 2025-11-16
**Maintained By**: Sim4D Team
