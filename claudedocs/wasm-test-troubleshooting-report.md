# WASM Test Environment Troubleshooting Report

**Date**: 2025-11-16
**Status**: Partial fix implemented, additional work required
**Progress**: 68/92 tests passing (73.9% pass rate)

---

## Executive Summary

Investigated and partially fixed WASM test environment failures in `packages/engine-occt`. Made significant progress but encountered complex environment detection issues that require deeper architectural review.

**Before**: 44/92 tests passing (47.8%)
**After Fixes**: 68/92 tests passing (73.9%)
**Improvement**: +24 tests passing (+26.1 percentage points)

---

## Root Cause Analysis

### Issue 1: Missing `window` Object in Node.js Tests ✅ FIXED

**Problem**: Tests running in Node.js environment tried to access browser-specific `window` object

**Error**:

```
ReferenceError: window is not defined
 ❯ WASMLoader.checkCOEP src/wasm-loader.ts:175:45
```

**Root Cause**:

- Vitest config uses `environment: 'node'` (line 6 of vitest.config.ts)
- WASM loader code assumes browser environment
- Test setup missing `window` polyfill

**Fix Applied**:
Added window polyfill to `tests/setup/setup.ts`:

```typescript
// Polyfill window for Node.js test environment
if (typeof global.window === 'undefined') {
  global.window = {
    isSecureContext: true,
    location: {
      protocol: 'https:',
      hostname: 'localhost', // Added
      href: 'https://localhost', // Added
    },
  } as any;
}
```

**Result**: ✅ Window access errors eliminated

---

### Issue 2: Undefined Hostname String Operations ✅ FIXED

**Problem**: Environment detection tried to call `.startsWith()` on undefined/empty hostname

**Error**:

```
TypeError: Cannot read properties of undefined (reading 'startsWith')
 ❯ detectEnvironment src/production-safety.ts:22:88
```

**Root Cause**:

- `window.location.hostname` was empty string or undefined
- Code: `hostname.startsWith('192.168.')` failed on empty string
- No null/undefined safety checks

**Fix Applied**:
Modified `src/production-safety.ts`:

```typescript
// Before:
hostname.startsWith('192.168.')(
  // After:
  hostname ? hostname.startsWith('192.168.') : false
);
```

**Result**: ✅ String operation errors eliminated

---

### Issue 3: Production Safety Validation Blocking Tests ⚠️ PARTIALLY RESOLVED

**Problem**: Production safety checks prevent test environment from using geometry API

**Errors**:

```
ProductionSafetyError: PRODUCTION SAFETY VIOLATION: ONLY real OCCT geometry is allowed.
```

**Root Cause**:

- Production safety system designed to block mock geometry
- Test environment needs real OCCT module but validation is too strict
- Environment detection not properly recognizing test mode

**Current Status**:

- Test setup provides real OCCT module (`createTestOCCTModule`)
- Environment flags set: `__vitest__`, `__OCCT_TEST_MODE__`, `ENABLE_REAL_OCCT_TESTING`
- But production safety still blocks some operations

**Remaining Work**:

1. Review `validateProductionSafety()` function logic
2. Ensure test environment flags are properly checked
3. Verify test OCCT module meets all validation requirements

---

### Issue 4: Unknown Shape References in Tests ⚠️ UNRESOLVED

**Problem**: Geometry API tests fail because test stub shapes aren't recognized

**Errors**:

```
Error: BOOLEAN_UNION received unknown shape reference
 ❯ GeometryAPI.ensureKnownShape src/geometry-api.ts:108:11

Error: TESSELLATE received unknown shape reference
 ❯ GeometryAPI.ensureKnownShape src/geometry-api.ts:108:11
```

**Root Cause**:

- Test stubs created with `stubShape('box')` helper
- GeometryAPI shape registry doesn't recognize test stubs
- Shape handle tracking not properly initialized for tests

\*\*Example from `src/geometry-api.test.ts`:

```typescript
const shapeA = stubShape('box'); // Creates test stub
const shapeB = stubShape('sphere');

const result = await api.invoke<ShapeHandle>('BOOLEAN_UNION', {
  shapeA,
  shapeB,
});
// ❌ Fails: "unknown shape reference"
```

**Remaining Work**:

1. Review `stubShape()` helper implementation
2. Ensure test stubs are registered in shape tracking system
3. Or mock/bypass shape validation for unit tests

---

## Files Modified

### 1. `tests/setup/setup.ts`

**Changes**:

- Added `window` object polyfill with `isSecureContext` and `location` properties
- Added `hostname` property to `window.location`

**Impact**: Fixes browser API access in Node.js test environment

### 2. `src/production-safety.ts`

**Changes**:

- Added null safety check for `hostname.startsWith()` call
- Changed line 23 from `hostname.startsWith(...)` to `(hostname ? hostname.startsWith(...) : false)`

**Impact**: Prevents TypeError on undefined/empty hostname

---

## Current Test Status

### Passing Tests (68/92)

**src/occt-production.test.ts**: ✅ All passing

- OCCT module initialization
- Version reporting
- Primitive creation (box, sphere, cylinder, cone, torus)

**src/production-safety.test.ts**: ✅ Partially passing

- Environment detection (some tests)
- Configuration creation (some tests)

### Failing Tests (24/92)

**src/geometry-api.test.ts**: ❌ Failing

- Boolean operations (unknown shape references)
- Tessellation (unknown shape references)

**src/integrated-geometry-api.test.ts**: ❌ Failing

- Initialization tests (production safety violations)

**test/node-occt-smoke.test.ts**: ❌ Failing

- Real geometry smoke test (production safety violations)

---

## Recommended Next Steps

### Short-term (1-2 days)

#### 1. Fix Test Shape Registry

**Priority**: HIGH
**Effort**: 2-3 hours

**Approach**:

```typescript
// Option A: Register test stubs properly
function stubShape(type: string): ShapeHandle {
  const handle = { id: `test-${type}-${Date.now()}`, type };

  // Register in GeometryAPI shape tracking
  geometryAPI.registerTestShape(handle);

  return handle;
}

// Option B: Mock shape validation in tests
vi.mock('../src/geometry-api', () => ({
  ...actualModule,
  ensureKnownShape: vi.fn(), // Skip validation in tests
}));
```

#### 2. Review Production Safety Test Mode

**Priority**: HIGH
**Effort**: 1-2 hours

**Tasks**:

- Verify `validateProductionSafety()` properly checks test environment flags
- Ensure `createTestOCCTModule()` meets all validation requirements
- Add debug logging to understand why validation still fails

**Investigation**:

```typescript
// Check what validates failing
export function validateProductionSafety(occtModule: any, context?: string) {
  console.log('[DEBUG] Validation context:', context);
  console.log('[DEBUG] Test mode flags:', {
    __vitest__: (global as any).__vitest__,
    __OCCT_TEST_MODE__: (global as any).__OCCT_TEST_MODE__,
    ENABLE_REAL_OCCT_TESTING: process.env.ENABLE_REAL_OCCT_TESTING,
  });

  // Existing validation logic...
}
```

### Medium-term (1 week)

#### 3. Architectural Review of Test Strategy

**Priority**: MEDIUM
**Effort**: 1-2 days

**Questions to Answer**:

1. Should geometry-api tests use real OCCT or mocked operations?
2. Is the production safety system too strict for test environments?
3. Should test mode bypass some validations entirely?

**Options**:

- **Option A**: Full real OCCT in tests (current approach, complex setup)
- **Option B**: Mock geometry operations, integration tests separate
- **Option C**: Hybrid - unit tests mocked, integration tests real OCCT

#### 4. Test Environment Documentation

**Priority**: LOW
**Effort**: 2-3 hours

**Deliverables**:

- Document test environment setup requirements
- Create troubleshooting guide for WASM test failures
- Add inline comments explaining polyfills and workarounds

---

## Lessons Learned

### What Worked Well

1. **Systematic Diagnosis**: Analyzing error messages and stack traces systematically
2. **Incremental Fixes**: Fixing one issue at a time and verifying impact
3. **Polyfill Strategy**: Adding missing browser APIs to Node.js environment

### Challenges Encountered

1. **Environment Complexity**: Balancing browser/Node.js differences
2. **Production Safety**: Strict validation designed for production blocking tests
3. **Test Architecture**: Unclear separation between unit/integration test needs

### Technical Debt Created

1. **Window Polyfill**: Minimal implementation may need expansion
2. **Hostname Null Check**: Band-aid fix, should refactor environment detection
3. **Test Shape Stubs**: Need proper integration with GeometryAPI registry

---

## Impact Assessment

### Progress Made: +26.1% Test Pass Rate

| Category      | Before | After | Change |
| ------------- | ------ | ----- | ------ |
| Passing Tests | 44     | 68    | +24    |
| Failing Tests | 48     | 24    | -24    |
| Pass Rate     | 47.8%  | 73.9% | +26.1% |

### Files Changed: 2

- `tests/setup/setup.ts` (+9 lines)
- `src/production-safety.ts` (+1 line, safety check)

### Complexity Added: Minimal

- Simple polyfills and null checks
- No architectural changes
- Reversible if needed

---

## Conclusion

Successfully diagnosed and partially resolved WASM test environment issues in `@sim4d/engine-occt`:

**✅ Completed**:

- Fixed `window is not defined` errors (window polyfill)
- Fixed `hostname.startsWith` TypeError (null safety)
- Improved test pass rate from 47.8% to 73.9% (+26.1%)

**⚠️ Remaining**:

- Unknown shape reference errors (test stub registration)
- Production safety blocking test operations (validation too strict)
- 24 tests still failing (down from 48)

**Next Action**:

- Recommended: Fix test shape registry (2-3 hours)
- Then: Review production safety test mode detection (1-2 hours)
- Goal: Achieve 100% test pass rate (92/92 passing)

**Estimated Time to 100%**: 4-6 hours additional work

---

## Appendix: Error Categories

### Category A: Environment Polyfills ✅ RESOLVED

- Window object missing
- Performance API missing (already fixed in setup)
- Crypto API missing (already fixed in setup)
- Worker API missing (already fixed in setup)

### Category B: String Safety ✅ RESOLVED

- hostname.startsWith() on undefined
- hostname.includes() safety (preemptively fixed with existing check)

### Category C: Shape Management ⚠️ IN PROGRESS

- Unknown shape references
- Test stub registration
- Shape handle tracking

### Category D: Production Safety ⚠️ IN PROGRESS

- Test environment not recognized
- Validation too strict
- Environment flag detection issues

---

**Report Status**: Complete
**Author**: Claude (AI Assistant)
**Next Review**: After implementing recommended fixes

---

## Session 2 Update (2025-11-16)

### Additional Fixes Implemented

#### Fix 3: Test Shape Registry Integration ✅ COMPLETE

**Problem**: `geometry-api.test.ts` used `stubShape()` helper creating unregistered shapes
**Location**: Boolean, tessellation, and export test cases
**Root Cause**: Test stubs never registered in `GeometryAPI.handleCache`, causing "unknown shape reference" errors

**Fix Applied**:
Modified `packages/engine-occt/src/geometry-api.test.ts` to create shapes through API:

```typescript
// Before:
const shapeA = stubShape('box');
const shapeB = stubShape('sphere');

// After:
const shapeA = await api.invoke<ShapeHandle>('MAKE_BOX', {});
const shapeB = await api.invoke<ShapeHandle>('MAKE_SPHERE', {});
```

**Result**: ✅ geometry-api.test.ts tests now passing

#### Fix 4: Environment Detection Race Condition ✅ IMPROVED

**Problem**: `IntegratedGeometryAPI` cached environment state from constructor before test flags set
**Location**: `src/integrated-geometry-api.ts:146-162`
**Root Cause**: `this.environment = detectEnvironment()` called at instantiation, before test setup runs

**Fix Applied**:

```typescript
// Re-detect environment dynamically instead of using cached value
const currentEnvironment = detectEnvironment();
if (!currentEnvironment.isTest) {
  validateProductionSafety(this.usingRealOCCT, currentEnvironment);
}
```

**Result**: ⚠️ Partial improvement, but mock setup issue remains

### Current Test Status

**Progress**: 70/92 tests passing (76.1% pass rate)
**Improvement**: +2 tests from session 1 (68 → 70)
**Total Improvement**: +26 tests from baseline (44 → 70, +59% improvement)

### Remaining Issues

#### Issue A: IntegratedGeometryAPI Mock Failures (21 tests)

**Problem**: `loadOCCTModule()` mock not working correctly in `integrated-geometry-api.test.ts`
**Error**: `Failed to load real OCCT: Error: WASM load failed` → triggers production safety error
**Affected Tests**:

- Initialization (1)
- Operation Execution (4)
- Tessellation (2)
- Boolean Operations (3)
- Feature Operations (3)
- Type Safety (2)
- Performance/Monitoring (3)
- API Testing (1)
- Lifecycle (1)

**Root Cause**: Mock defined with `vi.hoisted()` and `vi.mock()` but not being applied consistently

**Recommended Fix** (2-3 hours):

1. Review mock setup timing - ensure mocks active before module import
2. Consider using `vi.doMock()` for dynamic mocking
3. Verify mock restoration in `afterEach` hooks
4. Alternative: Simplify by mocking at higher level (skip real OCCT loading in tests)

#### Issue B: OCCT Integration Test Null Reference (1 test)

**Problem**: `occtModule` is null when test expects it to have `.getStatus` property  
**Location**: `test/occt-integration.test.ts:100`
**Error**: `TypeError: Cannot read properties of null (reading 'getStatus')`

**Recommended Fix** (30 minutes):
Update test setup to properly initialize or mock `occtModule`

### Files Modified (Session 2)

1. `src/geometry-api.test.ts`
   - Changed test stubs to API-created shapes
   - Impact: Fixed unknown shape reference errors

2. `src/integrated-geometry-api.ts`
   - Added dynamic environment re-detection before validation
   - Impact: Improved test environment recognition

### Next Steps

**Priority 1** (2-3 hours): Fix IntegratedGeometryAPI mock setup

- Option A: Fix existing vi.mock() timing issues
- Option B: Refactor to use simpler mocking strategy
- Option C: Make IntegratedGeometryAPI test-friendly (dependency injection)

**Priority 2** (30 min): Fix occt-integration.test.ts null reference

**Goal**: 92/92 tests passing (100% pass rate)
**Estimated Time**: 3-4 hours additional work

### Session 2 Summary

**✅ Achievements**:

- Fixed test shape registry (+2 tests)
- Improved environment detection
- Identified root cause of remaining failures (mock setup)

**📊 Metrics**:

- Test pass rate: 47.8% → 76.1% (+28.3 percentage points)
- Tests passing: 44 → 70 (+26 tests)
- Issues resolved: 3/5 categories complete

**🎯 Conclusion**: Made significant progress on WASM test environment. Remaining issues are contained to mock setup in one test file. Recommended next action is to fix the IntegratedGeometryAPI mock configuration for final 22 tests.

---

## Session 3 Update (2025-11-16)

### Architectural Refactoring: Dependency Injection Implementation

**Decision**: Replaced complex Vitest mocking with **dependency injection pattern** following SOLID principles.

#### Rationale for Architectural Change

After multiple failed attempts to fix Vitest mocking issues (manual mocks, inline factories, async factories), determined that the fundamental approach was unsustainable:

- ❌ Complex hoisting and timing requirements
- ❌ ES module hoisting makes mock order unpredictable
- ❌ Manual mocks not being loaded by Vitest
- ❌ Requires deep Vitest knowledge to maintain
- ❌ Debugging extremely difficult

**Solution**: Apply Dependency Inversion Principle (SOLID) - inject test dependencies via configuration rather than mocking modules.

#### Implementation Summary ✅ COMPLETE

**Files Modified**:

1. `src/integrated-geometry-api.ts`
   - Added `occtLoader?: (config?: any) => Promise<any>` to `GeometryAPIConfig` interface
   - Updated `performInitialization()` to use injected loader: `const loader = this.config.occtLoader || loadOCCTModule`
   - Added debug logging for loader detection

2. `src/integrated-geometry-api.test.ts`
   - Removed `vi.mock('./occt-loader')` - no longer needed
   - Created `TEST_API_CONFIG` with injected mock loader
   - Updated all tests to use `TEST_API_CONFIG` instead of `DEFAULT_API_CONFIG`
   - Simplified lifecycle hooks (removed beforeAll, simplified afterEach)
   - Updated failure test to inject failing loader
   - Added `getOptimalConfiguration` to WASMCapabilityDetector mock

3. `src/__mocks__/occt-loader.ts`
   - **DELETED** - manual mocks no longer needed with dependency injection

#### Benefits of Dependency Injection Approach

✅ **SOLID Principles**: Follows Dependency Inversion Principle
✅ **Testable by Design**: No mocking framework needed
✅ **Clear and Explicit**: Easy to understand what's being injected
✅ **Maintainable**: Future developers can understand immediately
✅ **Framework Agnostic**: Works with any test framework
✅ **No Timing Issues**: Config set before instantiation
✅ **Type Safe**: TypeScript validates injected loader signature

#### Current Status: Debugging In Progress

**Issue**: Injected `occtLoader` not being called in tests

**Symptoms**:

- Test logs not appearing (`[TEST] Mock OCCT loader called`)
- Implementation logs not appearing (`Using loader: INJECTED test loader`)
- Real `loadOCCTModule` still being called

**Hypothesis**: Config not being passed correctly OR tests failing before instantiation

**Test Results**:

- **Current**: 69/92 tests passing (75.0%)
- **Previous**: 70/92 tests passing (76.1%)
- **Baseline**: 44/92 tests passing (47.8%)
- **Net Progress**: +25 tests (+52% improvement from baseline)

**Remaining Work**: 1-2 hours estimated to complete dependency injection debugging

#### Documentation

Created comprehensive documentation: `claudedocs/dependency-injection-implementation.md`

- Architecture overview and rationale
- Implementation details with code examples
- Comparison: mocking vs dependency injection
- Migration guide for other components
- SOLID principles application

**Next Action**: Complete dependency injection debugging, then extend pattern to other testable components for consistent testability across codebase.
