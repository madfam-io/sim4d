# Constraint Solver Coverage Crisis - Root Cause Analysis

**Date**: 2025-11-17  
**Status**: Critical - 3.9% Coverage, 18/20 Tests Failing  
**Severity**: 🔴 CRITICAL

---

## Executive Summary

The `@brepflow/constraint-solver` package has a **fundamental implementation gap**: comprehensive tests were written for an API that doesn't fully exist yet. The 3.9% coverage is masking a deeper problem - the tests themselves are broken because they reference unimplemented methods and expect behavior that isn't coded.

---

## Root Causes Identified

### 1. **Missing API Methods**

Tests reference methods that don't exist in `Solver2D`:

```typescript
// Tests call these:
solver.addVariable(variable); // ❌ Method doesn't exist
solver.setInitialValues({ test: 100 }); // ❌ Method doesn't exist
solver.getVariableValues(); // ❌ Method doesn't exist
solver.clear(); // ❌ Method doesn't exist

// Only these exist:
solver.addEntity(entity); // ✅ Exists
solver.addConstraint(constraint); // ✅ Exists
solver.solve(); // ✅ Exists (but has bugs)
```

**Evidence**: `TypeError: solver.addVariable is not a function` in 5 tests

---

### 2. **Entity Structure Mismatch**

Tests were written assuming simple `Point2D` objects would work:

```typescript
// Tests originally did this (WRONG):
const p1: Point2D = { id: 'p1', x: 0, y: 0 };
solver.addConstraint({ entities: [p1, p2] }); // Passed objects

// Implementation expects (CORRECT):
const p1 = { id: 'p1', type: 'point', params: [0, 0], fixed: [false, false] };
solver.addEntity(p1); // Register entity first
solver.addConstraint({ entities: ['p1', 'p2'] }); // Pass IDs as strings
```

**Status**: ✅ **FIXED** - Created `createPointEntity()` helper and updated 12 tests

---

### 3. **Math.min Corruption Bug**

Bizarre error: `TypeError: Math.min is not a function`

**Location**: `solver-2d.js:290`

```javascript
for (let i = 0; i < Math.min(n, m); i++) {
```

**Hypothesis**: Something in the test setup or vitest environment is corrupting the global `Math` object. This suggests:

- Possible polyfill conflict
- Test isolation issue
- Import order problem

**Impact**: 7 tests fail with this error

---

### 4. **API Design Inconsistency**

The solver has **two different interfaces** mixed together:

**Interface A**: Entity-based (implemented in `solver-2d.js`)

```typescript
solver.addEntity({ id: 'p1', type: 'point', params: [0, 0], fixed: [false, false] });
solver.addConstraint({ id: 'c1', type: 'distance', entities: ['p1', 'p2'] });
```

**Interface B**: Variable-based (tests expect but not implemented)

```typescript
solver.addVariable({ id: 'var1', value: 10, type: 'x' });
solver.setInitialValues({ var1: 100 });
solver.getVariableValues(); // Returns { var1: 100 }
```

**Problem**: Tests were written for Interface B, but only Interface A exists

---

## Test Failure Breakdown

| Error Type                            | Count | Severity    | Status               |
| ------------------------------------- | ----- | ----------- | -------------------- |
| `addVariable is not a function`       | 5     | 🔴 Critical | API Missing          |
| `Math.min is not a function`          | 7     | 🔴 Critical | Environment Bug      |
| `Entity [object Object] not found`    | 3     | 🟡 Medium   | Partially Fixed      |
| `Cannot read properties of undefined` | 2     | 🟡 Medium   | Edge Case            |
| `expected undefined to be +0`         | 1     | 🟢 Low      | Return Type Mismatch |

**Total**: 18 failures out of 20 tests

---

## Coverage Analysis

```bash
Current Coverage: 3.9%
Target Coverage: 80%
Gap: 76.1 percentage points
```

**Why Coverage is Low**:

1. **18/20 tests fail** - failing tests don't execute code paths
2. **Missing methods** - large chunks of expected API don't exist
3. **Implementation incomplete** - `solver-2d.js` has partial constraint evaluation

**Files in Package**:

```
src/
├── constraints.ts          # Type definitions
├── dimensional-constraints.ts
├── geometry-constraints.ts
├── index.ts               # Package exports
├── solver.ts              # High-level solver interface
├── solver-2d.ts           # 2D solver (TypeScript source)
├── solver-2d.js           # 2D solver (Compiled JavaScript - used by tests)
├── solver-2d.test.ts      # Basic tests (2 tests, both pass)
├── solver-2d.comprehensive.test.ts  # Comprehensive tests (18 failures)
├── solver-engine.ts       # Generic constraint solver engine
└── types.ts               # Type definitions
```

---

## What's Actually Implemented

### ✅ Working Code

```typescript
// solver-2d.js (Lines implemented):
class Solver2D {
  addEntity(entity); // ✅ Works
  addConstraint(constraint); // ✅ Works (validates entity IDs)
  solve(); // ⚠️ Works but has bugs

  // Constraint evaluators:
  evaluateCoincident(); // ✅ Implemented
  evaluateDistance(); // ✅ Implemented
  evaluateHorizontal(); // ✅ Implemented
  evaluateVertical(); // ✅ Implemented
  evaluateParallel(); // ✅ Implemented
  evaluatePerpendicular(); // ✅ Implemented
  evaluateAngle(); // ✅ Implemented
  evaluateRadius(); // ✅ Implemented
  evaluateFixed(); // ✅ Implemented
}
```

### ❌ Missing Code (Tests Expect)

```typescript
// NOT IMPLEMENTED:
addVariable(variable);
setInitialValues(values);
getVariableValues();
clear();
```

---

## Recommendations

### Option 1: **Remove Broken Tests** (Quick Fix - NOT RECOMMENDED)

- Delete `solver-2d.comprehensive.test.ts`
- Keep only `solver-2d.test.ts` (2 passing tests)
- Coverage stays at 3.9%
- **Problem**: Hides the real issue, technical debt grows

---

### Option 2: **Fix Tests to Match Implementation** (Recommended)

**Time Estimate**: 2-3 hours

**Actions**:

1. ✅ **DONE**: Fix entity structure with `createPointEntity()` helper
2. ✅ **DONE**: Update constraint entities to use string IDs
3. **TODO**: Remove all tests that use `addVariable()`, `setInitialValues()`, `getVariableValues()`, `clear()`
4. **TODO**: Investigate and fix `Math.min is not a function` bug
5. **TODO**: Write new tests for **actually implemented** methods

**Expected Outcome**:

- Tests pass: ~12/20 (after removing variable-based tests)
- Coverage: ~40-50% (measuring what actually exists)

---

### Option 3: **Implement Missing API** (Ideal but Time-Consuming)

**Time Estimate**: 1-2 days

**Actions**:

1. Implement `addVariable()`, `setInitialValues()`, `getVariableValues()`, `clear()`
2. Decide on unified API: entity-based OR variable-based
3. Fix `Math.min` bug
4. Make all 20 tests pass
5. Add more tests for edge cases

**Expected Outcome**:

- Tests pass: 20/20
- Coverage: 80%+
- Production-ready constraint solver

---

### Option 4: **Defer Coverage Goal** (Pragmatic)

**Recommended for current sprint**

**Actions**:

1. Document implementation gaps (this file)
2. Disable `solver-2d.comprehensive.test.ts` temporarily
3. Add to technical debt backlog
4. Set coverage exception for `@brepflow/constraint-solver`
5. Focus on other packages with clearer paths to 80%

**Rationale**:

- Constraint solver is **not currently critical path** (per CLAUDE.md: "optional OCCT.wasm for real CAD")
- Other packages (collaboration, engine-core, viewport) are more critical
- Fixing this properly requires architectural decisions about API design
- Can revisit in Week 2-3 after core stability achieved

---

## Immediate Next Steps

**For Current Session** (Constraint Solver Coverage Crisis):

1. ✅ Document root causes (this file)
2. ✅ Identify scope of implementation gap
3. 🔄 **RECOMMENDATION**: Choose Option 4 (Defer)
4. Move to higher-priority packages for coverage improvement

**For Follow-up** (Technical Debt Backlog):

- Create GitHub issue: "Constraint Solver API Implementation Gap"
- Add to roadmap: Phase 2 - Advanced Features
- Design unified constraint solver API
- Implement missing methods with proper tests

---

## Files Modified This Session

### Fixed Files ✅

- `solver-2d.comprehensive.test.ts`: Added `createPointEntity()` helper, fixed entity structure
- `scripts/fix-constraint-tests.js`: Created entity ID fix script
- `scripts/fix-all-constraint-tests.sh`: Created Point2D conversion script

### Discovered Issues 🔍

- `solver-2d.js`: Missing 4 API methods, Math.min bug
- `types.ts`: Type definitions don't match implementation
- `vitest.config.ts`: Potential environment issue causing Math corruption

---

## Success Metrics

### Current State

- ✅ Root cause identified
- ✅ API gaps documented
- ✅ 12 tests partially fixed (entity structure)
- ❌ 18 tests still failing (API missing)
- ❌ Coverage still 3.9%

### Target State (Option 4 - Deferred)

- ✅ Technical debt documented
- ✅ Move to higher-priority packages
- ⏳ Constraint solver improvements scheduled for Phase 2

### Target State (Option 2 - If pursued)

- 12+ tests passing
- 40-50% coverage
- Clear separation of working vs unimplemented features

### Target State (Option 3 - Ideal)

- 20/20 tests passing
- 80%+ coverage
- Production-ready API
- 1-2 days investment

---

## Conclusion

The constraint-solver "coverage crisis" is actually an **implementation gap crisis**. The tests are comprehensive and well-written, but they were created for an API that was never fully implemented.

**Recommendation**: Accept Option 4 (Defer) for now, document as technical debt, and focus on packages where tests actually match implementation. This is pragmatic given the current sprint goal of achieving stability across critical packages.

**Critical vs Non-Critical**:

- ✅ **Critical**: engine-core, collaboration, viewport, nodes-core
- ⚠️ **Nice-to-Have**: constraint-solver (geometric constraints not in MVP)
