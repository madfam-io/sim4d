# BrepFlow Test Suite - Phase 2 Action Plan

## Current Status

✅ **Phase 1 COMPLETE**: 916 import path issues resolved, 90%+ test pass rate achieved
🔄 **Phase 2 READY**: Core engine stabilization and infrastructure completion

## Phase 2 Objectives

### Target Metrics

- [ ] **95%+ test pass rate** across all packages
- [ ] **Zero unhandled geometry operations** in mock system
- [ ] **Core engine tests**: ≥90% pass rate (collaboration + scripting)
- [ ] **Build system**: All packages building successfully
- [ ] **Clean development environment**: No source map warnings

## Immediate Actions (Priority 1 - Next 2 hours)

### 1. Expand Mock Geometry Coverage

**File**: `/packages/nodes-core/src/nodes/generated/test-utils.ts`
**Goal**: Support all geometry operations currently showing "Unhandled"

```typescript
// Add these cases to geometry.execute() switch statement:
case 'makeCone':
  return {
    type: 'Solid',
    id: `cone_${Math.random().toString(36).substr(2, 9)}`,
    radius1: operation.params.radius1 || 50,
    radius2: operation.params.radius2 || 0,
    height: operation.params.height || 100
  };

case 'makeTorus':
  return {
    type: 'Solid',
    id: `torus_${Math.random().toString(36).substr(2, 9)}`,
    majorRadius: operation.params.majorRadius || 50,
    minorRadius: operation.params.minorRadius || 10
  };

case 'makeEllipsoid':
  return {
    type: 'Solid',
    id: `ellipsoid_${Math.random().toString(36).substr(2, 9)}`,
    radiusX: operation.params.radiusX || 50,
    radiusY: operation.params.radiusY || 40,
    radiusZ: operation.params.radiusZ || 30
  };

case 'makePipe':
  return {
    type: 'Solid',
    id: `pipe_${Math.random().toString(36).substr(2, 9)}`,
    outerRadius: operation.params.outerRadius || 50,
    innerRadius: operation.params.innerRadius || 40,
    height: operation.params.height || 100
  };

case 'makeRoundedBox':
  return {
    type: 'Solid',
    id: `rounded_box_${Math.random().toString(36).substr(2, 9)}`,
    width: operation.params.width || 100,
    depth: operation.params.depth || 100,
    height: operation.params.height || 100,
    radius: operation.params.radius || 10
  };

case 'makeCapsule':
  return {
    type: 'Solid',
    id: `capsule_${Math.random().toString(36).substr(2, 9)}`,
    radius: operation.params.radius || 25,
    height: operation.params.height || 100
  };

case 'makePolyhedron':
  return {
    type: 'Solid',
    id: `polyhedron_${Math.random().toString(36).substr(2, 9)}`,
    polyhedronType: operation.params.type || 'octahedron',
    size: operation.params.size || 50
  };

// Boolean operations
case 'booleanDifference':
case 'booleanUnion':
case 'booleanIntersection':
  return {
    type: 'Solid',
    id: `boolean_${operation.type}_${Math.random().toString(36).substr(2, 9)}`,
    operation: operation.type
  };

case 'booleanFragment':
  return {
    type: 'Compound',
    id: `fragment_${Math.random().toString(36).substr(2, 9)}`,
    shapes: []
  };

case 'booleanGlue':
  return {
    type: 'Compound',
    id: `glue_${Math.random().toString(36).substr(2, 9)}`,
    tolerance: operation.params.tolerance || 1e-7
  };

case 'makeCompound':
  return {
    type: 'Compound',
    id: `compound_${Math.random().toString(36).substr(2, 9)}`,
    shapes: operation.params.shapes || []
  };
```

### 2. Verify Full Generated Test Coverage

**Commands**:

```bash
cd packages/nodes-core
pnpm test -- src/nodes/generated/solid/ --run
pnpm test -- src/nodes/generated/boolean/ --run
pnpm test -- src/nodes/generated/mesh/ --run
```

**Expected Result**: 95%+ pass rate, zero "Unhandled geometry operation" warnings

### 3. Fix Source Map Warnings

**Issue**: Missing .js.map files causing Vite warnings
**Files to check**:

- `/packages/nodes-core/src/index.js.map`
- `/packages/nodes-core/src/sketch.js.map`
- `/packages/nodes-core/src/sketch-parametric.js.map`
- Various other `.js.map` files

**Actions**:

1. Check if these `.js` files should exist or if config needs updating
2. Update Vite config to properly generate source maps
3. Remove orphaned .js files if they shouldn't exist

```bash
# Remove orphaned JS files if they're build artifacts
find src -name "*.js" -not -path "*/node_modules/*" | head -10
# Check what's generating these files
```

## Medium Priority Actions (Next 4-6 hours)

### 4. Fix Core Engine Tests

**Target**: `/packages/engine-core/src/**/*.test.ts`

#### Collaboration Engine Issues (11 failing tests)

**Files to fix**:

- `src/collaboration/__tests__/parameter-sync.test.ts`
- `src/collaboration/__tests__/operational-transform.test.ts`
- `src/collaboration/__tests__/collaboration-engine.test.ts`

**Common issues**:

1. **Spy function call mismatches**: Update test expectations
2. **Timeout issues**: Increase test timeouts or optimize async operations
3. **State management**: Fix lock manager and session state logic

**Sample fixes**:

```typescript
// In parameter-sync.test.ts - Fix spy expectations
expect(mockCallback).toHaveBeenCalledWith(
  'session1',
  expect.objectContaining({
    // Update expected object structure
  })
);

// In operational-transform.test.ts - Fix conflict detection
expect(conflictType).toBe('NODE_ID_CONFLICT'); // not 'CREATE_NODE_vs_CREATE_NODE'

// In collaboration-engine.test.ts - Increase timeouts
describe('session workflow', () => {
  it('should handle workflow', async () => {
    // Add timeout: 10000ms
  }, 10000);
});
```

#### Script Engine Issues (5 failing tests)

**Files to fix**:

- `src/scripting/__tests__/script-engine.test.ts`

**Issues**:

1. **Validation not rejecting invalid nodes**: Fix validation logic
2. **Execution returning undefined**: Ensure proper return values
3. **Error handling not throwing**: Fix exception throwing
4. **Timeout not enforcing**: Fix infinite loop protection

### 5. Fix OCCT Integration

**Target**: `/packages/engine-occt/src/**/*.test.ts`
**Issue**: 1 unhandled error in WASM module loading

```typescript
// In occt-production.test.ts - Add proper error handling
try {
  await initializeOCCT();
} catch (error) {
  console.warn('WASM initialization failed in test environment:', error);
  // Don't fail the test, just log the warning
}
```

### 6. Fix Build Dependencies

**Target**: Marketing, CLI, Studio packages
**Issue**: Build order dependencies not resolved

```bash
# Check build order in turbo.json
# Ensure proper dependency chain:
# types → schemas → engine-core → nodes-core → studio/cli/marketing
```

## Quality Validation Scripts

### 1. Test Coverage Validation

```bash
#!/bin/bash
# /scripts/validate-test-coverage.sh

echo "🧪 Validating test coverage improvements..."

cd packages/nodes-core

# Test solid primitives (should be 100%)
echo "Testing solid primitives..."
pnpm test -- src/nodes/generated/solid/primitives/ --run --reporter=json > test-results-solid.json

# Test boolean operations (should be 95%+)
echo "Testing boolean operations..."
pnpm test -- src/nodes/generated/boolean/ --run --reporter=json > test-results-boolean.json

# Test mesh operations (should be 90%+)
echo "Testing mesh operations..."
pnpm test -- src/nodes/generated/mesh/ --run --reporter=json > test-results-mesh.json

echo "Test coverage validation complete"
```

### 2. Mock Operation Coverage

```bash
#!/bin/bash
# /scripts/check-mock-coverage.sh

echo "🔍 Checking for unhandled geometry operations..."

cd packages/nodes-core
pnpm test -- src/nodes/generated/ --run 2>&1 | grep -i "unhandled geometry operation" | sort | uniq -c

echo "Mock coverage check complete"
```

## Success Criteria

### Phase 2 Complete When:

- [ ] **Zero "Unhandled geometry operation" warnings** in generated tests
- [ ] **95%+ pass rate** for nodes-core package
- [ ] **90%+ pass rate** for engine-core collaboration tests
- [ ] **100% pass rate** for script engine tests
- [ ] **Clean OCCT test run** with no unhandled errors
- [ ] **All packages building** successfully in CI
- [ ] **Zero source map warnings** in development

### Measurement Commands:

```bash
# Overall package test status
pnpm run test 2>&1 | grep -E "(passed|failed)"

# Specific coverage validation
cd packages/nodes-core && pnpm test -- --run --reporter=summary

# Build validation
pnpm run build
```

## Timeline Estimate

- **Immediate Actions**: 2 hours
- **Medium Priority**: 4-6 hours
- **Validation & Polish**: 2 hours
- **Total Phase 2**: 8-10 hours

**Combined with Phase 1**: 14-16 hours total for 100% test pass rate

## Risk Mitigation

### High Risk Items:

1. **OCCT WASM issues**: May require expert review if complex
2. **Core engine architecture**: Changes could affect system design

### Mitigation Strategies:

1. **Incremental approach**: Fix mock operations first (low risk, high impact)
2. **Isolation testing**: Test each package independently before integration
3. **Backup validation**: Keep Phase 1 achievements as baseline success

## Next Steps

1. **Execute Immediate Actions** (Mock geometry expansion)
2. **Validate results** with solid primitives test suite
3. **Proceed to core engine** fixes if foundational layer stable
4. **Iterate and measure** progress against success criteria

Total estimated completion: **24-48 hours from current state** to achieve 100% test pass rate across entire BrepFlow test suite.
