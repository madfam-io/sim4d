# Logging Migration Guide

**Purpose**: Convert console statements to structured logging
**Target**: Reduce 708 console statements to <50
**Timeline**: 3-4 weeks (systematic package-by-package migration)

---

## Quick Start

### Step 1: Import Logger

```typescript
// For Studio components:
import { Logger } from '@/lib/logging/logger';

// For packages (create logger utility):
import { createLogger } from '../utils/logger';
```

### Step 2: Initialize Logger

```typescript
// In apps/studio (singleton pattern):
const logger = Logger.getInstance(config, sessionId);

// In packages (factory pattern):
const logger = createLogger('PackageName');
```

### Step 3: Replace Console Statements

```typescript
// Before:
console.log('User added node', nodeData);

// After:
logger.info('User added node', {
  nodeId: nodeData.id,
  nodeType: nodeData.type,
  timestamp: Date.now(),
});
```

---

## Migration Patterns

### Pattern 1: Simple Info Logs

```typescript
// ❌ Before:
console.log('Graph loaded');
console.log('Graph loaded with', nodeCount, 'nodes');
console.log(`Loaded ${nodeCount} nodes and ${edgeCount} edges`);

// ✅ After:
logger.info('Graph loaded');
logger.info('Graph loaded', { nodeCount });
logger.info('Graph loaded', { nodeCount, edgeCount });
```

**Rule**: All variable data goes in the `data` object, not string interpolation.

---

### Pattern 2: Error Logging

```typescript
// ❌ Before:
console.error('Failed to evaluate node:', error);
console.error('Evaluation failed', nodeId, error.message);

// ✅ After:
logger.error('Node evaluation failed', {
  error: error.message,
  stack: error.stack,
  nodeId,
  nodeType: node.type,
});

// ⚠️ Avoid logging sensitive data:
logger.error('Authentication failed', {
  username,
  // ❌ password: password, // NEVER log passwords
  errorCode: error.code,
});
```

**Rule**: Include error message, stack trace, and context. Logger auto-sanitizes sensitive fields.

---

### Pattern 3: Debug/Development Logs

```typescript
// ❌ Before:
console.log('DEBUG: Cache hit for', key);
console.log('[DEV] Evaluating node chain:', nodeIds);

// ✅ After:
logger.debug('Cache hit', { cacheKey: key, hitRate: stats.hitRate });
logger.debug('Evaluating node chain', { nodeIds, chainLength: nodeIds.length });
```

**Rule**: Use `logger.debug()` for development/debugging. Automatically filtered in production.

---

### Pattern 4: Warnings

```typescript
// ❌ Before:
console.warn('Slow operation detected:', duration, 'ms');
console.warn('Deprecated API usage in node:', nodeType);

// ✅ After:
logger.warn('Slow operation detected', {
  operation: 'graph_evaluation',
  duration_ms: duration,
  threshold_ms: 1000,
  performanceImpact: 'high',
});

logger.warn('Deprecated API usage', {
  nodeType,
  deprecatedAPI: 'oldEvaluate',
  replacement: 'evaluate',
  sunsetDate: '2026-06-01',
});
```

**Rule**: Include severity context and actionable remediation info.

---

### Pattern 5: Performance Timing

```typescript
// ❌ Before:
console.time('evaluate');
// ... work ...
console.timeEnd('evaluate');

const start = performance.now();
// ... work ...
console.log('Evaluation took', performance.now() - start, 'ms');

// ✅ After:
import { TimingLogger } from '@/lib/logging/logger';

const timer = new TimingLogger(logger, 'graph_evaluation', {
  nodeCount,
  complexity: 'high',
});
// ... work ...
timer.finish({ nodesEvaluated: count, cacheHits: hits });

// Or manually:
const start = performance.now();
// ... work ...
logger.info('Evaluation completed', {
  operation: 'graph_evaluation',
  duration_ms: performance.now() - start,
  nodeCount,
  throughput: nodeCount / duration,
});
```

**Rule**: Use `TimingLogger` for operations, include throughput metrics.

---

### Pattern 6: Conditional Logging

```typescript
// ❌ Before:
if (DEBUG) {
  console.log('Detailed graph state:', graph);
}

// ✅ After:
logger.debug('Graph state snapshot', {
  nodes: graph.nodes.map((n) => ({ id: n.id, type: n.type })),
  edges: graph.edges.length,
  isDirty: graph.dirty,
});

// Logger automatically filters based on level
// No need for manual DEBUG conditionals
```

**Rule**: Logger handles level filtering. Use appropriate log levels instead of manual conditionals.

---

### Pattern 7: Child Loggers with Context

```typescript
// ❌ Before:
console.log('[GraphStore] Node added:', nodeId);
console.log('[GraphStore] Edge created:', edgeId);
console.log('[DAGEngine] Evaluation started for node:', nodeId);

// ✅ After:
// Create child logger with persistent context:
const graphLogger = logger.createChild({ component: 'GraphStore' });
const dagLogger = logger.createChild({ component: 'DAGEngine' });

graphLogger.info('Node added', { nodeId });
graphLogger.info('Edge created', { edgeId });
dagLogger.info('Evaluation started', { nodeId });

// All logs automatically include component context
```

**Rule**: Use child loggers for components with repeated context.

---

## Package-Specific Guidelines

### apps/studio (157 statements)

**Priority Order**:

1. User interaction (Toolbar, Inspector, Canvas)
2. Graph operations (GraphStore, node management)
3. Error boundaries and feedback
4. Initialization and lifecycle

**Logger Setup**:

```typescript
// apps/studio/src/lib/logging/index.ts (create this)
import { Logger } from './logger';

let loggerInstance: Logger | null = null;

export function initializeLogger(sessionId: string): Logger {
  const config = {
    console: true,
    remote: import.meta.env.PROD, // Remote logging in production
    level: import.meta.env.DEV ? 'debug' : 'info',
    structured: true,
  };

  loggerInstance = Logger.getInstance(config, sessionId);
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    throw new Error('Logger not initialized. Call initializeLogger() first.');
  }
  return loggerInstance;
}

// Convenience exports
export { TimingLogger, ChildLogger, LogLevel } from './logger';
```

**Usage in Components**:

```typescript
// apps/studio/src/components/Canvas.tsx
import { getLogger } from '@/lib/logging';

export function Canvas() {
  const logger = getLogger().createChild({ component: 'Canvas' });

  const handleNodeAdd = (nodeType: string) => {
    logger.info('User added node', { nodeType, position });
  };

  const handleError = (error: Error) => {
    logger.error('Canvas error', {
      error: error.message,
      stack: error.stack,
      userAction: 'add_node',
    });
  };

  return /* ... */;
}
```

---

### packages/engine-core (69 statements)

**Priority Order**:

1. DAG evaluation lifecycle
2. Dirty propagation and cache
3. Error propagation
4. Script execution (when implemented)

**Logger Setup**:

```typescript
// packages/engine-core/src/utils/logger.ts (create this)
export function createLogger(packageName: string) {
  // Simple console-based logger for packages (no singleton)
  return {
    debug: (msg: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${packageName}] ${msg}`, data || '');
      }
    },
    info: (msg: string, data?: any) => {
      console.info(`[${packageName}] ${msg}`, data || '');
    },
    warn: (msg: string, data?: any) => {
      console.warn(`[${packageName}] ${msg}`, data || '');
    },
    error: (msg: string, data?: any) => {
      console.error(`[${packageName}] ${msg}`, data || '');
    },
  };
}
```

**Usage in Engine**:

```typescript
// packages/engine-core/src/dag/engine.ts
import { createLogger } from '../utils/logger';

const logger = createLogger('DAGEngine');

class DAGEngine {
  evaluate(graph: Graph): void {
    logger.info('Starting evaluation', {
      nodeCount: graph.nodes.length,
      dirtyNodes: graph.dirtyNodes.length,
    });

    try {
      // ... evaluation logic ...
      logger.info('Evaluation completed', {
        duration_ms: elapsed,
        nodesEvaluated: count,
      });
    } catch (error) {
      logger.error('Evaluation failed', {
        error: error.message,
        nodeId: currentNode?.id,
      });
      throw error;
    }
  }
}
```

---

### packages/engine-occt (320 statements)

**Special Considerations**:

- Many logs are WASM debugging → Keep for development
- Focus on user-facing geometry errors first
- Preserve performance diagnostics

**Strategy**:

```typescript
// packages/engine-occt/src/utils/logger.ts
export const occtLogger = createLogger('OCCT');

// Keep critical WASM diagnostics as debug logs:
occtLogger.debug('WASM module loaded', {
  wasmSize: module.size,
  threadingSupported: module.threading,
});

// Convert user-facing errors:
occtLogger.error('Boolean operation failed', {
  operation: 'UNION',
  inputShapes: shapes.length,
  wasmError: error.message,
});

// Performance metrics:
occtLogger.info('Geometry operation completed', {
  operation: 'MAKE_BOX',
  duration_ms: elapsed,
  outputHandleId: result.id,
});
```

---

### packages/nodes-core (104 statements)

**Note**: Many console statements are in **generated code**.

**Strategy**:

1. Fix generator templates to use logger
2. Manually migrate handcrafted nodes
3. Regenerate node catalogue

**Generator Template Fix**:

```typescript
// packages/nodes-core/src/generator/templates/node-template.ts

// ❌ Before (in template):
console.log('Evaluating ${nodeName}');

// ✅ After (in template):
import { createLogger } from '../utils/logger';
const logger = createLogger('Node::${nodeName}');

logger.debug('Evaluating node', { inputs, parameters });
```

---

## Testing Logging Migration

### Unit Tests

```typescript
// packages/logger/src/logger.test.ts
import { Logger, LogLevel } from './logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance(
      { console: true, level: 'debug', structured: true },
      'test-session'
    );
  });

  it('logs at appropriate levels', () => {
    const consoleSpy = vi.spyOn(console, 'info');

    logger.info('Test message', { key: 'value' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.objectContaining({
        message: 'Test message',
        data: { key: 'value' },
      })
    );
  });

  it('sanitizes sensitive data', () => {
    const logs = logger.getLogBuffer();

    logger.info('User login', {
      username: 'alice',
      password: 'secret123',
      token: 'Bearer xyz',
    });

    const log = logs[logs.length - 1];
    expect(log.data.username).toBe('alice');
    expect(log.data.password).toBe('[REDACTED]');
    expect(log.data.token).toBe('[REDACTED]');
  });

  it('respects log level configuration', () => {
    const debugLogger = Logger.getInstance(
      { console: true, level: 'warn', structured: true },
      'test-session-2'
    );

    const debugSpy = vi.spyOn(console, 'debug');
    const warnSpy = vi.spyOn(console, 'warn');

    debugLogger.debug('Debug message'); // Should not log
    debugLogger.warn('Warning message'); // Should log

    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('creates child loggers with context', () => {
    const child = logger.createChild({ component: 'GraphStore' });

    child.info('Action performed', { action: 'add_node' });

    const logs = logger.getLogBuffer();
    expect(logs[0].context).toEqual({
      component: 'GraphStore',
      action: 'add_node',
    });
  });
});
```

---

## Migration Checklist

### Before Starting

- [ ] Read this guide completely
- [ ] Understand structured logging benefits
- [ ] Review logger API documentation
- [ ] Set up dev environment for testing

### During Migration (Per File)

- [ ] Identify all console statements in file
- [ ] Import logger at top of file
- [ ] Convert each console statement following patterns
- [ ] Replace string interpolation with data objects
- [ ] Use appropriate log levels (debug/info/warn/error)
- [ ] Add context data for debugging
- [ ] Test migrated file in development
- [ ] Verify logs appear with correct structure
- [ ] Remove old console statements completely

### After Migration (Per Package)

- [ ] Run linter to catch remaining console statements
- [ ] Test package functionality
- [ ] Verify error logs include stack traces
- [ ] Check performance impact (should be minimal)
- [ ] Update package README with logging info
- [ ] Create PR with migration changes

---

## Common Mistakes to Avoid

### ❌ Mistake 1: String Interpolation

```typescript
// ❌ Wrong:
logger.info(`Node ${nodeId} evaluated in ${duration}ms`);

// ✅ Correct:
logger.info('Node evaluated', { nodeId, duration_ms: duration });
```

### ❌ Mistake 2: Logging Sensitive Data

```typescript
// ❌ Wrong:
logger.info('User authenticated', { password, apiKey });

// ✅ Correct:
logger.info('User authenticated', { userId, username });
// Logger auto-sanitizes, but don't log sensitive data intentionally
```

### ❌ Mistake 3: Wrong Log Levels

```typescript
// ❌ Wrong:
logger.error('Cache miss'); // Not an error
logger.info('Database connection failed'); // IS an error

// ✅ Correct:
logger.debug('Cache miss', { cacheKey });
logger.error('Database connection failed', { error: err.message });
```

### ❌ Mistake 4: Inconsistent Naming

```typescript
// ❌ Wrong:
logger.info('node added', { nodeID: id, Type: type });
logger.info('Node created', { node_id: id, nodeType: type });

// ✅ Correct (consistent naming):
logger.info('Node added', { nodeId: id, nodeType: type });
logger.info('Node created', { nodeId: id, nodeType: type });
```

### ❌ Mistake 5: Not Using Child Loggers

```typescript
// ❌ Wrong:
logger.info('[GraphStore] Node added', { nodeId });
logger.info('[GraphStore] Edge created', { edgeId });

// ✅ Correct:
const graphLogger = logger.createChild({ component: 'GraphStore' });
graphLogger.info('Node added', { nodeId });
graphLogger.info('Edge created', { edgeId });
```

---

## Log Level Guidelines

### DEBUG

**Use for**: Development diagnostics, verbose tracing
**Examples**: Cache hits/misses, internal state, step-by-step flow
**Production**: Disabled (filtered out)

```typescript
logger.debug('Cache lookup', { key, hit: true, size: cache.size });
logger.debug('Graph state', { nodes: graph.nodes.length, isDirty });
```

### INFO

**Use for**: Normal operations, milestones, user actions
**Examples**: User interactions, lifecycle events, important state changes
**Production**: Enabled

```typescript
logger.info('User added node', { nodeType, nodeId });
logger.info('Graph evaluation completed', { duration_ms, nodeCount });
```

### WARN

**Use for**: Recoverable issues, degraded performance, deprecated usage
**Examples**: Slow operations, deprecated APIs, retries
**Production**: Enabled

```typescript
logger.warn('Slow evaluation', { duration_ms: 2500, threshold: 1000 });
logger.warn('Deprecated API', { api: 'oldMethod', replacement: 'newMethod' });
```

### ERROR

**Use for**: Failures, exceptions, critical issues
**Examples**: Operation failures, caught exceptions, critical errors
**Production**: Enabled

```typescript
logger.error('Evaluation failed', { error: err.message, stack: err.stack });
logger.error('WASM operation failed', { operation, wasmError });
```

---

## Production Configuration

### Environment-Based Logging

```typescript
// apps/studio/src/lib/logging/config.ts
export const getLoggingConfig = () => {
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;

  return {
    console: true,
    remote: isProd, // Only send to remote in production
    level: isDev ? 'debug' : 'info', // Debug in dev, info in prod
    structured: true,
    sampling: isProd ? 0.1 : 1.0, // Sample 10% in prod, 100% in dev
  };
};
```

### Remote Logging Setup (Future)

```typescript
// apps/studio/src/lib/logging/logger.ts (line 187)
private async flushBuffer(): Promise<void> {
  // Production remote logging endpoint:
  await fetch('https://logs.sim4d.com/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`
    },
    body: JSON.stringify({
      logs: logsToFlush,
      source: 'sim4d-studio',
      environment: import.meta.env.MODE
    })
  });
}
```

---

## Success Metrics

### Week 1 (apps/studio)

- ✅ Console statements: 157 → <10 (94% reduction)
- ✅ All user actions logged with context
- ✅ Error logs include stack traces
- ✅ No sensitive data in logs

### Week 2 (packages/engine-core)

- ✅ Console statements: 69 → <5 (93% reduction)
- ✅ Evaluation lifecycle traceable
- ✅ Performance metrics available
- ✅ Cache hits/misses tracked

### Week 3 (packages/collaboration + occt)

- ✅ Console statements: 378 → <25 (93% reduction)
- ✅ WebSocket lifecycle logged
- ✅ WASM operations structured
- ✅ Geometry errors actionable

### Overall

- ✅ Total: 708 → <50 (93% reduction)
- ✅ Structured logging throughout
- ✅ Production observability ready
- ✅ Development debugging improved

---

## Resources

- **Logger Implementation**: `apps/studio/src/lib/logging/logger.ts`
- **Implementation Plan**: `claudedocs/horizon-0-implementation-plan.md`
- **This Guide**: `claudedocs/logging-migration-guide.md`

---

## Questions?

**Where to log?**

- User actions → INFO
- Errors/failures → ERROR
- Performance concerns → WARN
- Internal diagnostics → DEBUG

**What to include in data?**

- IDs (nodeId, edgeId, sessionId)
- Counts (nodeCount, duration_ms)
- Types (nodeType, operation)
- Context (component, userAction)
- Never: passwords, tokens, secrets

**When to use TimingLogger?**

- Operations >100ms
- User-visible operations
- Performance-critical code paths

**Child logger vs. context parameter?**

- Repeated context → Child logger
- One-time context → Context parameter
