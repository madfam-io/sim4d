# Mock Geometry Elimination - 2025-11-13

## CRITICAL POLICY CHANGE

**ONLY REAL OCCT GEOMETRY IS ACCEPTABLE. NO MOCK GEOMETRY ANYWHERE.**

This policy was established on 2025-11-13 and ALL mock geometry code has been eliminated from the codebase.

## Changes Made

### 1. Engine-OCCT Package (`packages/engine-occt/`)

**Files Modified:**

- `src/occt-worker.ts` - Removed `useMock: false` flags from responses
- `src/production-safety.ts` - Completely rewritten to enforce ONLY real OCCT
  - Removed `allowMockGeometry` flag
  - Changed all functions to fail hard when real OCCT not available
  - NO fallback logic, NO "it's okay" messages
- `src/occt-bindings.ts` - Changed all WASM loading failures to throw errors
  - NO "Using mock geometry" messages
  - NO "Run build:wasm" suggestions (WASM already built)
  - FAIL HARD when WASM not available
- `src/occt-wrapper.ts` - Updated error message to be critical

### 2. Engine-Core Package (`packages/engine-core/`)

**Already Clean:**

- `src/geometry-api-factory.ts` - Already enforces real OCCT only
- No mock geometry references found

### 3. Key Error Message Changes

**Before:**

```
"Using mock geometry"
"Run pnpm run build:wasm to enable real geometry"
"Falling back to mock geometry"
"This is expected if WASM hasn't been compiled yet"
```

**After:**

```
"CRITICAL: Real OCCT WASM MUST be available. ONLY real geometry is supported."
"PRODUCTION SAFETY VIOLATION: Real OCCT geometry not available"
```

### 4. Production Safety Rewrite

**Old Behavior:**

- Allow mock in development/test
- Warn in production
- Provide fallback paths

**New Behavior:**

- NO mock allowed ANYWHERE
- Throw ProductionSafetyError if real OCCT not available
- FAIL HARD - no fallbacks, no "helpful" messages

## WASM Status

**OCCT WASM is BUILT and READY:**

```
packages/engine-occt/wasm/
├── occt.wasm (13 MB)
├── occt.js (202 KB)
├── occt-core.wasm (8.7 MB)
├── occt-core.js (150 KB)
├── occt-core.node.wasm (8.3 MB)
├── occt-core.node.mjs (173 KB)
└── occt_geometry.wasm (31 MB)
```

Built on: September 2024
Status: Production ready
Libraries: 47 OCCT libraries linked

## Testing Impact

**Integration Tests:**

- Tests that relied on "mock fallback" will now FAIL
- This is CORRECT behavior
- Tests must either:
  1. Use real OCCT (preferred)
  2. Be explicitly skipped with clear reason
  3. Be removed if they were testing mock behavior

**Expected Test Failures:**

- Any test checking "mock vs real" behavior → DELETE
- Any test with "useMock" flags → UPDATE to expect only real
- Any test that says "skip if WASM not available" → WASM IS AVAILABLE

## Code Patterns to NEVER Use Again

❌ **FORBIDDEN:**

```typescript
// NO!
if (wasmAvailable) {
  useReal();
} else {
  useMock();
}

// NO!
const geometry = mock || real;

// NO!
console.log('Using mock geometry');

// NO!
console.log('Run build:wasm to enable real geometry');
```

✅ **REQUIRED:**

```typescript
// YES!
if (!realOCCTAvailable) {
  throw new Error('CRITICAL: ONLY real OCCT is supported');
}

// YES!
validateProductionSafety(usingRealOCCT); // throws if false

// YES!
const geometry = getRealOCCTGeometry(); // throws if unavailable
```

## Developer Guidelines

1. **NEVER add mock geometry code**
2. **NEVER add fallback logic for missing WASM**
3. **ALWAYS throw errors when real OCCT unavailable**
4. **NEVER suggest "build:wasm" - it's already built**
5. **FAIL FAST and FAIL LOUD**

## Verification Commands

```bash
# Search for ANY mock references (should find NONE in code)
grep -r "mock.*geometry\|MockGeometry\|useMock" packages/*/src --include="*.ts"

# Verify WASM files exist
ls -lh packages/engine-occt/wasm/

# Run tests - they should use real OCCT or fail explicitly
pnpm test
```

## Memory Update

This memory supersedes any previous guidance about mock geometry being acceptable in development or test environments.

**ABSOLUTE RULE: ONLY REAL GEOMETRY. NO EXCEPTIONS.**
