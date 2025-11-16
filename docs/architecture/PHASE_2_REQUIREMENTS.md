# Phase 2 Architecture Requirements

## Date: 2025-09-17

## Overview

This document outlines the remaining architectural improvements needed after completing Phase 1 of the long-term solutions for BrepFlow.

## Current Status

### ✅ Phase 1 Completed:

- **Type System Architecture**: Centralized, immutable, branded types
- **Build Configuration**: Standardized across all packages
- **TypeScript Errors**: Reduced from 400+ to 0
- **Project Builds**: Successfully compiling and running

### ⚠️ Known Issues:

1. **Constraint-solver DTS Generation**
   - Issue: tsup sourcemap error at line 65 prevents DTS generation
   - Workaround: DTS temporarily disabled for this package
   - Impact: Type definitions not available for external consumers

2. **Decorator Metadata Warning**
   - Issue: "@swc/core was not installed, skipping swc plugin"
   - Impact: Minor - decorators still work but without optimization

## Phase 2 Requirements

### 1. Complete DTS Generation Fix

**Priority**: High
**Location**: `packages/constraint-solver/tsup.config.ts`

**Tasks**:

- Investigate tsup sourcemap issue at line 65
- Consider alternative build tools if tsup issue persists
- Ensure all packages generate proper .d.ts files

**Solution Options**:

```typescript
// Option 1: Use rollup-plugin-dts directly
import dts from 'rollup-plugin-dts';

// Option 2: Use tsc for DTS generation separately
"scripts": {
  "build:dts": "tsc --emitDeclarationOnly"
}

// Option 3: Upgrade tsup and dependencies
```

### 2. Module Boundary Enforcement

**Priority**: High
**Impact**: Prevents circular dependencies and maintains clean architecture

**Implementation**:

- Create `packages/core` for shared utilities
- Establish clear dependency hierarchy:
  ```
  types (no deps)
  ↓
  core (depends on types)
  ↓
  engine-core (depends on types, core)
  ↓
  engine-occt, nodes-core (depend on engine-core, types)
  ↓
  studio (depends on all)
  ```
- Use ESLint rules to enforce boundaries:
  ```json
  {
    "rules": {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          "patterns": ["../../../*"]
        }
      ]
    }
  }
  ```

### 3. Complete Type Migration

**Priority**: Medium
**Location**: All packages

**Tasks**:

- Migrate all string identifiers to branded types
- Replace all array-based Vec3 usage with object notation
- Implement comprehensive error handling using new error system

**Example Migration**:

```typescript
// Before
const nodeId: string = 'node-123';
const pos = [1, 2, 3];

// After
import { NodeId, createNodeId, Vec3 } from '@brepflow/types';
const nodeId: NodeId = createNodeId('node-123');
const pos: Vec3 = { x: 1, y: 2, z: 3 };
```

### 4. Testing Infrastructure

**Priority**: High
**Coverage Target**: 80%

**Components**:

- Unit tests for all core modules
- Integration tests for package interactions
- E2E tests for critical workflows
- Performance benchmarks

**Test Structure**:

```
tests/
  unit/
    types/
    engine-core/
    constraint-solver/
  integration/
    node-evaluation/
    constraint-solving/
  e2e/
    project-creation/
    export-workflow/
  performance/
    large-graphs/
    complex-geometry/
```

### 5. Performance Optimizations

**Priority**: Medium

**Areas**:

- Enable SWC for faster builds
- Implement proper code splitting
- Add lazy loading for heavy modules
- Optimize bundle sizes

**Metrics**:

- Build time: < 10s for full monorepo
- Bundle size: < 500KB for initial load
- Time to interactive: < 2s

### 6. Documentation Completion

**Priority**: Low-Medium

**Required Docs**:

- API documentation for all public interfaces
- Migration guide from Phase 1 to Phase 2
- Architecture decision records (ADRs)
- Contributing guidelines update

### 7. CI/CD Pipeline Hardening

**Priority**: Medium

**Requirements**:

- Type checking in CI
- Automated testing on PRs
- Bundle size monitoring
- Performance regression detection
- Automated dependency updates

## Implementation Timeline

### Week 1-2: Foundation

- Fix DTS generation issue
- Complete module boundary enforcement
- Set up testing infrastructure

### Week 3-4: Migration

- Complete type migration across packages
- Add comprehensive test coverage
- Document migration patterns

### Week 5-6: Optimization

- Performance improvements
- Bundle optimization
- CI/CD pipeline setup

### Week 7-8: Polish

- Complete documentation
- Final testing and validation
- Performance benchmarking

## Success Criteria

✅ All packages generate proper TypeScript definitions
✅ Zero circular dependencies detected
✅ 80% test coverage achieved
✅ Build time under 10 seconds
✅ All branded types consistently used
✅ Documentation complete and accurate

## Risk Mitigation

### Risk: tsup DTS issue cannot be resolved

**Mitigation**: Fall back to using tsc directly for type generation

### Risk: Breaking changes during migration

**Mitigation**: Use feature flags and gradual rollout

### Risk: Performance regression

**Mitigation**: Implement benchmarking before optimization

## Notes

- Phase 2 should be implemented incrementally
- Each change should be validated with tests
- Backward compatibility should be maintained where possible
- Breaking changes should be documented and versioned properly

## Related Documents

- `LONG_TERM_FIXES.md`: Original architecture plan
- `IMPLEMENTATION_SUMMARY.md`: Phase 1 completion summary
- `tsconfig.strict.json`: Strict TypeScript configuration
- `build/tsup.base.config.ts`: Standardized build configuration
