# TypeScript Strict Mode Migration Plan

**Date**: 2025-11-16  
**Purpose**: Eliminate `any` types and enable TypeScript strict mode  
**Impact**: 254 `any` occurrences in engine-core  
**Priority**: HIGH  
**Estimated Effort**: 4-6 weeks (incremental)

---

## Executive Summary

The BrepFlow codebase has **254 occurrences of `any` type** in `packages/engine-core`, primarily in:

- Collaboration system (parameter-sync, operational-transform, types)
- Scripting system (javascript-executor, script-engine, types)
- Geometry API factory
- DAG engine

These `any` types reduce type safety and make the codebase harder to maintain. This plan outlines a systematic migration to proper TypeScript types with strict mode enabled.

---

## Current State

### TypeScript Configuration

**Current** (`packages/engine-core/tsconfig.json`):

```json
{
  "compilerOptions": {
    // No strict mode flags
    "skipLibCheck": true,
    "verbatimModuleSyntax": false
  },
  "exclude": [
    // Many files excluded from type checking
    "src/collaboration/**/*",
    "src/scripting/**/*",
    "src/constraints/**/*"
    // ... more exclusions
  ]
}
```

**Issue**: Large portions of codebase excluded from type checking.

---

## Migration Strategy

### Phase 1: Enable Incremental Strict Checks (Week 1-2)

Enable strict mode flags **one at a time**, fixing errors incrementally:

```json
{
  "compilerOptions": {
    // Phase 1.1: No implicit any
    "noImplicitAny": true, // ← Start here

    // Phase 1.2: Strict null checks
    "strictNullChecks": false, // ← Enable after 1.1

    // Phase 1.3: Other strict flags (enable after 1.2)
    "strictFunctionTypes": false,
    "strictBindCallApply": false,
    "strictPropertyInitialization": false,
    "noImplicitThis": false,
    "alwaysStrict": false
  }
}
```

---

### Phase 2: Fix High-Impact Files (Week 3-4)

Priority order based on usage and blast radius:

#### 1. Core Types & Interfaces

**Files**:

- `src/scripting/types.ts` (11 `any` occurrences)
- `src/collaboration/types.ts` (12 `any` occurrences)

**Strategy**: Define proper type interfaces

```typescript
// Before
export type ScriptContext = any;

// After
export interface ScriptContext {
  nodeId: NodeId;
  params: Record<string, unknown>;
  inputs: Record<string, unknown>;
  getNode: (id: NodeId) => NodeInstance | undefined;
  // ... explicit properties
}
```

---

#### 2. Scripting System

**Files**:

- `src/scripting/javascript-executor.ts` (15 `any`)
- `src/scripting/script-engine.ts` (13 `any`)

**Strategy**: Use proper types for JavaScript evaluation

```typescript
// Before
function evaluate(code: string, context: any): any {
  return eval(code);
}

// After
function evaluate<T = unknown>(code: string, context: ScriptContext): Result<T, Error> {
  try {
    const result = new Function('context', code)(context);
    return { ok: true, value: result as T };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

---

#### 3. Collaboration System

**Files**:

- `src/collaboration/parameter-sync.ts` (12 `any`)
- `src/collaboration/operational-transform.ts` (13 `any`)
- `src/collaboration/collaboration-engine.ts` (23 `any`)

**Strategy**: Define operation types explicitly

```typescript
// Before
export interface Operation {
  type: string;
  data: any;
}

// After
export type Operation =
  | { type: 'AddNode'; data: NodeInstance }
  | { type: 'RemoveNode'; data: { nodeId: NodeId } }
  | { type: 'UpdateParam'; data: { nodeId: NodeId; paramName: string; value: ParamValue } }
  | { type: 'AddEdge'; data: Edge }
  | { type: 'RemoveEdge'; data: { edgeId: string } };
```

---

#### 4. Geometry API Factory

**Files**:

- `src/geometry-api-factory.ts` (8 `any`)

**Strategy**: Use generic constraints

```typescript
// Before
export function createAPI(config: any): any {
  // ...
}

// After
export function createAPI<T extends GeometryAPI>(config: GeometryConfig): T {
  // ...
}
```

---

#### 5. DAG Engine

**Files**:

- `src/dag-engine.ts` (7 `any`)
- `src/dag-engine.test.ts` (12 `any` - mostly test mocks)

**Strategy**: Proper worker API types

```typescript
// Before
interface DAGEngineConfig {
  worker: any;
}

// After
interface DAGEngineConfig {
  worker: WorkerAPI; // Properly typed interface
}

interface WorkerAPI {
  invoke(operation: string, data: unknown): Promise<GeometryResult>;
  dispose(): Promise<void>;
  // ... explicit methods
}
```

---

### Phase 3: Enable Remaining Strict Flags (Week 5)

After fixing the high-impact `any` types, enable remaining strict flags:

```json
{
  "compilerOptions": {
    "noImplicitAny": true, // ✅ Enabled in Phase 1
    "strictNullChecks": true, // ✅ Enabled in Phase 1
    "strictFunctionTypes": true, // ← Enable now
    "strictBindCallApply": true, // ← Enable now
    "strictPropertyInitialization": true, // ← Enable now
    "noImplicitThis": true, // ← Enable now
    "alwaysStrict": true, // ← Enable now

    // Ultimate goal
    "strict": true // ← Enables all strict flags
  }
}
```

---

### Phase 4: Remove tsconfig Exclusions (Week 6)

Gradually remove excluded directories from `tsconfig.json`:

```json
{
  "exclude": [
    "dist",
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts"
    // Remove these gradually as files are fixed:
    // "src/collaboration/**/*",      ← Remove after collaboration fixed
    // "src/scripting/**/*",          ← Remove after scripting fixed
    // "src/constraints/**/*",        ← Remove after constraints fixed
  ]
}
```

---

## Common Patterns & Solutions

### Pattern 1: Function Parameters

**Before**:

```typescript
function processNode(node: any, params: any) {
  return node.type + params.value;
}
```

**After**:

```typescript
function processNode(node: NodeInstance, params: Record<string, ParamValue>): string {
  return node.type + String(params.value);
}
```

---

### Pattern 2: Generic Collections

**Before**:

```typescript
const cache: Map<string, any> = new Map();
```

**After**:

```typescript
const cache: Map<string, GeometryResult> = new Map();
// Or for truly heterogeneous data:
const cache: Map<string, unknown> = new Map();
```

---

### Pattern 3: Event Handlers

**Before**:

```typescript
function handleMessage(event: any) {
  console.log(event.data);
}
```

**After**:

```typescript
interface MessageEvent<T = unknown> {
  data: T;
  type: string;
  timestamp: number;
}

function handleMessage(event: MessageEvent<OperationData>) {
  console.log(event.data);
}
```

---

### Pattern 4: Dynamic Property Access

**Before**:

```typescript
function getValue(obj: any, key: string): any {
  return obj[key];
}
```

**After**:

```typescript
function getValue<T extends Record<string, unknown>>(obj: T, key: keyof T): T[typeof key] {
  return obj[key];
}

// Or for truly dynamic access:
function getValueUnsafe(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}
```

---

### Pattern 5: External API Integration

**Before**:

```typescript
const workerAPI: any = await loadWorker();
```

**After**:

```typescript
interface WorkerAPI {
  invoke(op: string, data: unknown): Promise<unknown>;
  dispose(): Promise<void>;
}

const workerAPI: WorkerAPI = await loadWorker();
```

---

## File-by-File Migration Checklist

### High Priority (15 files)

- [ ] `src/scripting/types.ts` (11 `any`)
- [ ] `src/scripting/javascript-executor.ts` (15 `any`)
- [ ] `src/scripting/script-engine.ts` (13 `any`)
- [ ] `src/collaboration/types.ts` (12 `any`)
- [ ] `src/collaboration/parameter-sync.ts` (12 `any`)
- [ ] `src/collaboration/operational-transform.ts` (13 `any`)
- [ ] `src/collaboration/collaboration-engine.ts` (23 `any`)
- [ ] `src/geometry-api-factory.ts` (8 `any`)
- [ ] `src/dag-engine.ts` (7 `any`)
- [ ] `src/dag-engine.test.ts` (12 `any` - test mocks)
- [ ] `src/performance-monitor.ts` (3 `any`)
- [ ] `src/cache.ts` (4 `any`)
- [ ] `src/hash.ts` (3 `any`)
- [ ] `src/constraints/registry/index.ts` (21 `any`)
- [ ] `src/constraints/index.ts` (4 `any`)

---

## Tooling & Automation

### Find `any` Usages

```bash
# Count any types in a package
grep -r "\bany\b" packages/engine-core/src --include="*.ts" | wc -l

# List files with any types
grep -r "\bany\b" packages/engine-core/src --include="*.ts" -l

# Show context around any usage
grep -r "\bany\b" packages/engine-core/src --include="*.ts" -C 2
```

### Enable Incremental Strict Checks

```bash
# Check impact of noImplicitAny
pnpm --filter @brepflow/engine-core run typecheck 2>&1 | grep "error TS7006"

# Count errors
pnpm --filter @brepflow/engine-core run typecheck 2>&1 | grep "error TS" | wc -l
```

### Type Coverage Tool

```bash
# Install type-coverage
pnpm add -D type-coverage

# Check current coverage
npx type-coverage --detail

# Set coverage threshold
npx type-coverage --at-least 90
```

---

## Testing Strategy

### Before Each Change

1. Run existing tests: `pnpm --filter @brepflow/engine-core run test`
2. Check type compilation: `pnpm --filter @brepflow/engine-core run typecheck`
3. Verify no runtime behavior changes

### After Each Change

1. Verify types are correct
2. Run full test suite
3. Check for type regressions in dependent packages

---

## Migration Progress Tracking

### Metrics

- **Total `any` occurrences**: 254
- **Files with `any`**: 28
- **Strict mode flags enabled**: 0/7

### Week-by-Week Goals

**Week 1-2**: Enable `noImplicitAny`, fix 50 occurrences  
**Week 3**: Fix collaboration system (60 occurrences)  
**Week 4**: Fix scripting system (40 occurrences)  
**Week 5**: Enable all strict flags, fix remaining issues  
**Week 6**: Remove tsconfig exclusions, final cleanup

---

## Benefits

### Before Migration

❌ Type safety gaps (254 `any` types)  
❌ Runtime errors not caught by compiler  
❌ Poor IDE autocomplete  
❌ Difficult refactoring  
❌ Hidden bugs

### After Migration

✅ Full type safety (`strict: true`)  
✅ Compile-time error detection  
✅ Excellent IDE support  
✅ Safe refactoring  
✅ Fewer runtime bugs

---

## Risks & Mitigation

| Risk              | Impact | Mitigation                               |
| ----------------- | ------ | ---------------------------------------- |
| Breaking changes  | HIGH   | Incremental migration, extensive testing |
| Time investment   | MEDIUM | Parallel work, phased approach           |
| Team productivity | MEDIUM | Clear documentation, pair programming    |
| Merge conflicts   | LOW    | Frequent small PRs, communicate changes  |

---

## Success Criteria

- [ ] Zero `any` types in production code (tests allowed sparingly)
- [ ] `"strict": true` enabled in all package tsconfigs
- [ ] No excluded directories in tsconfig
- [ ] All tests passing
- [ ] No TypeScript compilation errors
- [ ] Type coverage > 95%

---

## Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- **Strict Mode Guide**: https://www.typescriptlang.org/tsconfig#strict
- **Migration Examples**: See `graph-store.ts` for typed Zustand patterns
- **Team Support**: Engineering office hours (Tuesdays 2-3pm)

---

**Status**: Ready to begin  
**Owner**: Engineering Team  
**Review Cadence**: Weekly progress sync  
**Completion Target**: 6 weeks from start
