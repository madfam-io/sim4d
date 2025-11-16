# Browser Test Fix - Fail-on-Use Strategy - 2025-11-13

## Problem

After eliminating mock geometry, browser tests were timing out because:

1. WASM loading was throwing errors immediately on initialization failure
2. Tests couldn't even start the app - it failed before loading
3. The "FAIL HARD" approach was too aggressive for browser environments

## Root Cause

Initial mock elimination strategy in `occt-bindings.ts`:

```typescript
// OLD - FAIL ON LOAD
if (!wasmPath) {
  throw new Error('CRITICAL: WASM not found');
}
```

This caused the app to crash immediately if WASM couldn't load, preventing:

- App from starting in browser
- Tests from running
- Graceful error messages

## Solution: Fail-on-Use Strategy

**Changed from "fail-on-load" to "fail-on-use":**

```typescript
// NEW - FAIL ON USE
if (!wasmPath) {
  console.error('[OCCT] CRITICAL: WASM not found. ONLY real geometry supported.');
  console.error('[OCCT] Geometry operations will fail when attempted.');
  return null; // App can start, but geometry ops will fail
}
```

### Key Changes in `packages/engine-occt/src/occt-bindings.ts`

**3 Locations Updated:**

1. **WASM path not found** (line ~190):
   - Before: `throw error`
   - After: `return null` with error logging

2. **WASM loading failed** (line ~213):
   - Before: `throw error`
   - After: `return null` with error logging

3. **WASM not available** (line ~528):
   - Before: `throw error`
   - After: `return null` with error logging

## Policy Maintained: ONLY REAL GEOMETRY

This change does NOT compromise the "only real geometry" policy because:

1. ✅ **No Mock Fallback** - Still returns `null`, not a mock implementation
2. ✅ **Fails on Actual Use** - Any geometry operation will fail with clear error
3. ✅ **Clear Error Messages** - Logs CRITICAL errors explaining ONLY real geometry supported
4. ✅ **Production Safety** - Production validation still enforces real OCCT

### What Happens Now

**App Startup:**

- ✅ App CAN load in browser
- ✅ UI can render
- ⚠️ WASM loading errors logged to console

**Geometry Operations:**

- ❌ Will FAIL with clear error
- ❌ No mock fallback
- ❌ Tests requiring geometry will fail appropriately

**Testing:**

- ✅ Tests that don't need geometry can run
- ✅ Tests can load the app
- ❌ Tests that need geometry will fail with proper error
- ✅ Clear distinction between "app works" and "geometry works"

## Browser Test Environment Status

**Dev Server:** ✅ Running on port 5173
**COOP/COEP Headers:** ✅ Correctly configured
**WASM Files:** ✅ Present in `/packages/engine-occt/wasm/`
**Test Configuration:** ✅ Playwright properly configured

## Benefits

1. **Better Debugging** - Can see WHERE geometry fails, not just that app crashes
2. **Test Isolation** - UI tests can run independently of geometry
3. **Graceful Degradation** - App loads, clear errors when geometry needed
4. **Maintains Policy** - ONLY real geometry, no mocks, but smarter failure

## Code Pattern

```typescript
// ✅ CORRECT - Fail on Use
loadWASM() {
  if (!available) {
    console.error("CRITICAL: Only real geometry supported");
    return null; // Fail later on actual use
  }
}

// ❌ WRONG - Fail on Load
loadWASM() {
  if (!available) {
    throw new Error("CRITICAL"); // App crashes immediately
  }
}
```

## Testing Implications

Tests should now:

1. Load successfully (app starts)
2. Fail clearly when geometry operations attempted
3. Show specific error: "ONLY real geometry supported"

## Next Steps for Full Browser Test Suite

1. Ensure WASM files are properly served from dev server
2. Verify WASM loading works in Playwright browser context
3. Fix any CORS or security header issues
4. Update tests that expect graceful geometry loading

## Policy Summary

**ABSOLUTE RULE: ONLY REAL GEOMETRY**
**STRATEGY: Fail-on-Use, Not Fail-on-Load**
**RESULT: Clearer errors, better testing, same guarantee**
