# Structured Logging Migration Guide

**Date**: 2025-11-16  
**Purpose**: Migrate console.\* calls to structured logger  
**Impact**: 151 console calls → structured logging  
**Priority**: HIGH

---

## Overview

Sim4D Studio has a comprehensive structured logging system that provides:

- **Log levels** (DEBUG, INFO, WARN, ERROR)
- **Structured data** for better querying
- **Data sanitization** (automatic redaction of sensitive keys)
- **Remote logging** support (buffered for performance)
- **Session tracking** (automatic session ID management)
- **Performance timing** utilities

However, the application currently has **151 console.\* calls** that bypass this system, making production debugging difficult.

---

## Migration Pattern

### Before (Console Logging)

```typescript
console.log('🚀 Geometry API initialized successfully');
console.error('❌ Failed to initialize geometry API:', error);
console.warn('DAG engine not initialized');
```

### After (Structured Logging)

```typescript
import { createChildLogger } from '@/lib/logging/logger-instance';

// Create module-specific logger (once per file)
const logger = createChildLogger({ module: 'graph-store' });

// Use structured logging
logger.info('Geometry API initialized successfully');
logger.error('Failed to initialize geometry API', {
  error: error.message,
  wasmSupport: crossOriginIsolated,
});
logger.warn('DAG engine not initialized - evaluation skipped');
```

---

## Step-by-Step Migration

### 1. Import the Logger

Add to top of file:

```typescript
import { createChildLogger } from '../lib/logging/logger-instance';

// Create module-specific logger with context
const logger = createChildLogger({ module: 'your-module-name' });
```

### 2. Map Console Calls to Log Levels

| Console Call      | Logger Method    | When to Use                                    |
| ----------------- | ---------------- | ---------------------------------------------- |
| `console.debug()` | `logger.debug()` | Development diagnostics, verbose details       |
| `console.log()`   | `logger.info()`  | Normal operations, user actions, state changes |
| `console.warn()`  | `logger.warn()`  | Warnings, recoverable errors, deprecated usage |
| `console.error()` | `logger.error()` | Errors, failures, exceptions                   |

### 3. Add Structured Data

**Bad** (loses context):

```typescript
console.log('Graph evaluation completed');
```

**Good** (structured data):

```typescript
logger.info('Graph evaluation completed', {
  duration_ms: duration.toFixed(2),
  dirtyNodeCount: dirtyNodes.size,
  nodeCount: graph.nodes.length,
});
```

### 4. Handle Errors Properly

**Bad**:

```typescript
console.error('Failed:', error);
```

**Good**:

```typescript
logger.error('Operation failed', {
  error: error instanceof Error ? error.message : String(error),
  operation: 'graph-evaluation',
  context: { nodeId, attempt: retryCount },
});
```

---

## Migration Examples

### Example 1: Simple Info Log

**Before**:

```typescript
console.log('User clicked node', nodeId);
```

**After**:

```typescript
logger.info('User clicked node', { nodeId, nodeType: node.type });
```

---

### Example 2: Error Logging with Context

**Before**:

```typescript
try {
  await saveGraph(graph);
} catch (error) {
  console.error('Save failed:', error);
}
```

**After**:

```typescript
try {
  await saveGraph(graph);
} catch (error) {
  logger.error('Graph save failed', {
    error: error instanceof Error ? error.message : String(error),
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    graphSize: JSON.stringify(graph).length,
  });
}
```

---

### Example 3: Performance Timing

**Before**:

```typescript
const start = performance.now();
await evaluateGraph();
console.log('Evaluation took', performance.now() - start, 'ms');
```

**After**:

```typescript
import { startTiming } from '../lib/logging/logger-instance';

const timing = startTiming('graph-evaluation', { dirtyNodes: dirtyNodes.size });
try {
  await evaluateGraph();
  timing.finish({ nodeCount: graph.nodes.length });
} catch (error) {
  timing.error(error, { nodeCount: graph.nodes.length });
}
```

---

### Example 4: Conditional Debug Logging

**Before**:

```typescript
if (import.meta.env.DEV) {
  console.debug('State update:', prevState, nextState);
}
```

**After**:

```typescript
// Logger handles this automatically based on log level config
logger.debug('State update', {
  previous: prevState,
  current: nextState,
  delta: computeDelta(prevState, nextState),
});
```

---

## Files Migrated

### ✅ Completed

- **apps/studio/src/store/graph-store.ts** (5 console calls → structured logging)

### 🔄 High Priority (Next)

- `apps/studio/src/App.tsx` (7 console calls)
- `apps/studio/src/api/collaboration.ts` (3 console calls)
- `apps/studio/src/hooks/useSession.ts` (8 console calls)
- `apps/studio/src/services/secure-websocket-client.ts` (14 console calls)

### 📋 Medium Priority

- `apps/studio/src/components/` (various files)
- `apps/studio/src/hooks/` (various files)
- `apps/studio/src/services/` (various files)

### 🟢 Low Priority

- Test files (can keep console for test debugging)
- Development-only utilities

---

## Configuration

### Environment Variables

Control logging behavior via environment variables:

```env
# Log level: debug | info | warn | error
VITE_LOG_LEVEL=info

# Enable remote logging (sends logs to backend)
VITE_REMOTE_LOGGING=false
```

### Production vs Development

**Development** (default):

- Log level: `debug`
- Console output: ✅ Structured JSON
- Remote logging: ❌ Disabled

**Production** (import.meta.env.PROD):

- Log level: `info`
- Console output: ✅ Simple strings
- Remote logging: ✅ Enabled (if configured)

---

## Data Sanitization

The logger automatically redacts sensitive data:

```typescript
logger.info('User authenticated', {
  username: 'alice',
  password: 'secret123', // ← Automatically redacted
  token: 'abc123', // ← Automatically redacted
});

// Output:
// {
//   username: 'alice',
//   password: '[REDACTED]',
//   token: '[REDACTED]'
// }
```

**Sensitive keys automatically redacted**:

- password
- token
- secret
- key
- authorization

---

## Benefits

### Before Migration

❌ No log levels (everything is `console.log`)  
❌ No structured data (strings only)  
❌ No remote logging capability  
❌ Sensitive data potentially exposed  
❌ No session tracking  
❌ Difficult to query/filter logs

### After Migration

✅ Proper log levels (debug/info/warn/error)  
✅ Structured, queryable data  
✅ Remote logging support  
✅ Automatic sensitive data redaction  
✅ Session tracking built-in  
✅ Easy filtering and analysis

---

## Testing

### Verify Logging Works

1. **Check console output**:

   ```typescript
   logger.info('Test message', { data: 'value' });
   // Should appear in console with timestamp and level
   ```

2. **Check log level filtering**:

   ```typescript
   // Set VITE_LOG_LEVEL=warn
   logger.debug('Should not appear');
   logger.info('Should not appear');
   logger.warn('Should appear');
   logger.error('Should appear');
   ```

3. **Check data sanitization**:
   ```typescript
   logger.info('Auth test', {
     user: 'alice',
     password: 'secret',
   });
   // Verify password is [REDACTED] in console
   ```

---

## Common Pitfalls

### ❌ Don't: Log large objects directly

```typescript
logger.info('State updated', state); // Could be huge!
```

### ✅ Do: Extract relevant fields

```typescript
logger.info('State updated', {
  nodeCount: state.nodes.length,
  selectedCount: state.selectedNodes.size,
  isDirty: state.isDirty,
});
```

---

### ❌ Don't: Concatenate strings

```typescript
logger.info('User ' + userId + ' performed ' + action);
```

### ✅ Do: Use structured data

```typescript
logger.info('User action', { userId, action });
```

---

### ❌ Don't: Log in hot paths without guards

```typescript
// Called 60fps in animation loop
function animate() {
  logger.debug('Frame rendered'); // Performance impact!
  // ...
}
```

### ✅ Do: Use performance-aware logging

```typescript
function animate() {
  // Only log every 60 frames
  if (frameCount % 60 === 0) {
    logger.debug('Animation stats', { fps: currentFps });
  }
  // ...
}
```

---

## Migration Progress

**Total console.\* calls**: 151  
**Migrated**: 5 (3%)  
**Remaining**: 146 (97%)

### Target Timeline

- **Week 1**: High-priority files (20 calls)
- **Week 2**: Medium-priority files (60 calls)
- **Week 3**: Low-priority files (66 calls)
- **Week 4**: Test files, cleanup (5 calls)

---

## Related Documentation

- **Logger Implementation**: `apps/studio/src/lib/logging/logger.ts`
- **Logger Instance**: `apps/studio/src/lib/logging/logger-instance.ts`
- **Monitoring Config**: `apps/studio/src/config/monitoring.ts`
- **Error Handling**: `apps/studio/src/lib/error-handling/`

---

## Questions?

For questions about the logging migration:

1. Review this guide
2. Check `logger.ts` for API details
3. See `graph-store.ts` for migration example
4. Consult the team lead for complex cases

---

**Status**: Ready for team-wide adoption  
**Owner**: Engineering Team  
**Estimated Effort**: 4 weeks (incremental)
