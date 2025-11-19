# Console.log Cleanup Migration Guide

## Overview

This guide documents the migration from console statements to structured logging in BrepFlow.

## Progress

| Package | Before | After | Removed | Status |
|---------|--------|-------|---------|--------|
| engine-core | 50 | 44 | 6 | ✅ Phase 1 |
| **engine-occt** | **343** | **30** | **313** | ✅ **Phase 2A** |
| **studio** | **19** | **14** | **5** | ✅ **Phase 2B** |
| Other packages | ~283 | ~249 | ~34 | 📋 Phase 3 |
| **TOTAL** | **~695** | **~383** | **~312** | **🔄 45% done** |

### Phase Completion:
- ✅ **Phase 1** (Nov 19): Logger infrastructure + engine-core partial (6 removed)
- ✅ **Phase 2A** (Nov 19): **engine-occt bulk cleanup (313 removed!)**
- ✅ **Phase 2B** (Nov 19): **Studio cleanup (5 removed) - analytics + logger-instance**
- 📋 **Phase 3**: Other packages (~249 statements)

## Target

- Reduce from ~695 to **<50** console statements
- Use structured logging for production code
- Maintain console for development/debugging where appropriate

## New Logger API

### For Packages (engine-core, engine-occt, etc.)

```typescript
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('MyModule');

// Instead of:
console.log('Starting operation');
console.error('Operation failed:', error);
console.warn('Deprecated feature used');

// Use:
logger.info('Starting operation');
logger.error('Operation failed', error);
logger.warn('Deprecated feature used');

// With context:
logger.info('Processing node', { nodeId, count: nodes.length });
```

### For Studio App

Studio already has a comprehensive logger in `apps/studio/src/lib/logging/logger.ts`:

```typescript
import { Logger } from '../lib/logging/logger';

const logger = Logger.getInstance();

logger.info('User action', userData);
logger.error('API call failed', error);
```

## Migration Patterns

### Pattern 1: Simple Logging

```typescript
// Before
console.log('Loading graph...');

// After
logger.info('Loading graph');
```

### Pattern 2: Error Logging

```typescript
// Before
console.error('Failed to load:', error);

// After
logger.error('Failed to load', error);
```

### Pattern 3: Logging with Data

```typescript
// Before
console.log('Evaluating node:', nodeId, params);

// After
logger.info('Evaluating node', { nodeId, params });
```

### Pattern 4: Conditional Logging

```typescript
// Before
if (config.debug) {
  console.debug('Debug info:', data);
}

// After
logger.debug('Debug info', { data });
// Logger handles level filtering automatically
```

## ESLint Configuration

Updated `.eslintrc.json` to warn on console usage:

```json
{
  "rules": {
    "no-console": ["warn", { "allow": [] }]
  }
}
```

Exceptions for test files are allowed in overrides.

## Automated Migration Script

For bulk replacements in engine-occt and other large files:

```bash
# Replace console.error
find packages/engine-occt/src -name "*.ts" -exec sed -i 's/console\.error/logger.error/g' {} \;

# Replace console.warn
find packages/engine-occt/src -name "*.ts" -exec sed -i 's/console\.warn/logger.warn/g' {} \;

# Replace console.info
find packages/engine-occt/src -name "*.ts" -exec sed -i 's/console\.info/logger.info/g' {} \;

# Replace console.log (more careful - review each)
find packages/engine-occt/src -name "*.ts" -exec sed -i 's/console\.log/logger.info/g' {} \;
```

**Important:** Always review automated changes for correctness!

## Phase 2 Plan

1. **engine-occt** (343 instances) - High priority
   - Use automated script with manual review
   - Focus on production code first
   - Keep console for WASM debugging where needed

2. **Studio** (19 instances)
   - Already has logger - just needs migration
   - Quick win

3. **Other packages** (~277 instances)
   - nodes-core, viewport, cli, etc.
   - Systematic migration package by package

## Test Files

Test files can continue using console for debugging:
- Already exempted in ESLint overrides
- Helps with test debugging
- Not part of production code

## Benefits

1. **Production-ready**: Structured logs can be sent to logging services
2. **Filterable**: Set log levels (DEBUG, INFO, WARN, ERROR)
3. **Contextual**: Add metadata to logs automatically
4. **Searchable**: Structured format for log aggregation
5. **Secure**: Automatic redaction of sensitive data

## Examples from Codebase

### DAGEngine (Completed)

```typescript
// engine-core/src/dag-engine.ts
import { createLogger } from './logger';

const dagLogger = createLogger('DAGEngine');

// Fallback logger now uses structured logging
loggerInstance = {
  error: (message: string, data?: unknown) =>
    dagLogger.error(message, undefined, data ? { data } : undefined),
  // ...
};
```

### GeometryAPIFactory (Completed)

```typescript
// engine-core/src/geometry-api-factory.ts
import { createLogger } from './logger';

const factoryLogger = createLogger('GeometryAPIFactory');

// Structured fallback
const structuredLogger: LoggerLike = {
  error: (message: string, data?: unknown) =>
    factoryLogger.error(message, undefined, data ? { data } : undefined),
  // ...
};
```

### Studio Analytics Service (Phase 2B Completed)

```typescript
// apps/studio/src/services/analytics.ts
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'Analytics' });

// Before: console.log('[Analytics]', event, metadata);
// After: logger.debug('[Analytics]', { event, metadata });

// Before: console.error('Failed to load analytics metrics:', error);
// After: logger.error('Failed to load analytics metrics', error);
```

**Files Updated (Phase 2B):**
- `apps/studio/src/services/analytics.ts` - 4 console statements replaced
- `apps/studio/src/lib/logging/logger-instance.ts` - 1 console.warn replaced

**Note:** Studio's remaining console statements are:
- 10 in `logger.ts` (intentional - logger implementation)
- 1 `console.clear()` in MonitoringDashboard (intentional UI button)
- 1 in test setup file
- 2 text references to "console" (not actual statements)

## Next Steps

1. ✅ ~~Complete engine-core migration~~ - Phase 1 done (6 removed)
2. ✅ ~~Start engine-occt migration~~ - Phase 2A done (313 removed!)
3. ✅ ~~Migrate studio~~ - Phase 2B done (5 removed)
4. **Phase 3**: Migrate remaining packages (~249 console statements in viewport, nodes-core, cli, etc.)
5. **Goal**: Reach final target of <50 console statements

## Verification

After migration:
```bash
# Count remaining console usage
grep -r "console\." packages apps --include="*.ts" --include="*.tsx" | wc -l

# Target: <50
```
