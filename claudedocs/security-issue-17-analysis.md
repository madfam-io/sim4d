# Security Issue #17: Script Executor Security Migration - Analysis

**Date**: 2025-11-18  
**Priority**: 🔴 HIGH (Critical)  
**Status**: Implementation In Progress, Test Failures Detected

## Executive Summary

The script executor security infrastructure is **partially implemented** with `isolated-vm` integration, but **20 out of 30 security tests are failing** due to value transferability issues between V8 isolates. The codebase has the right architecture in place but requires fixes to properly transfer data between the main thread and isolated execution contexts.

## Current Implementation Status

### ✅ **Completed Components**

1. **Isolated-VM Integration** (`packages/engine-core/src/scripting/isolated-vm-executor.ts`)
   - Full V8 isolate-based sandboxing implemented
   - Memory limit enforcement (10MB default, configurable)
   - Timeout enforcement (5000ms default)
   - Script size limits (100KB max)
   - Isolate pooling for performance (max 3 concurrent)

2. **Security Checks Implemented**
   - Pre-execution validation
   - Dangerous pattern detection (eval, Function, **proto**, prototype mutation)
   - Size validation
   - CSP compliance checks
   - Script blacklisting for repeated malicious attempts

3. **Comprehensive Security Test Suite** (`packages/engine-core/src/scripting/__tests__/security.test.ts`)
   - 30 test cases covering:
     - Prototype pollution prevention (3 tests) ✅
     - Global scope access prevention (4 tests) ❌
     - eval()/Function() prevention (3 tests) ✅
     - Memory limit enforcement (2 tests) ⚠️
     - Timeout enforcement (2 tests) ⚠️
     - Script size validation (2 tests) ✅
     - Dangerous pattern detection (3 tests) ❌
     - Sandbox API access control (3 tests) ❌
     - Context isolation (2 tests) ❌
     - ReDoS prevention (1 test) ✅
     - Injection attack prevention (2 tests) ❌
     - Safe execution examples (3 tests) ❌

4. **Architecture**
   - `JavaScriptExecutor` delegates to `IsolatedVMExecutor`
   - Worker-based execution with abort controllers
   - Secure sandbox creation with frozen prototypes
   - Capability whitelisting (Math, console, ctx, Vector3, performance)

### ❌ **Failing Components (20/30 tests)**

#### Root Cause: Value Transferability Issues

The primary issue is that `isolated-vm` requires explicit value transfer between the main thread and isolated contexts. The current implementation attempts to pass complex objects directly, which fails with:

```
Error: A non-transferable value was passed
```

#### Specific Failures

1. **Global Scope Access Tests** (4 failures)
   - Tests checking for `process`, `require`, `import`, `window/document` access
   - Issue: Return values from isolate not properly extracted
   - Expected: `result.success === true` with outputs indicating undefined globals
   - Actual: `result.success === false` due to transfer errors

2. **Memory & Timeout Tests** (3 failures)
   - "should allow execution within memory limits"
   - "should enforce execution timeouts"
   - "should allow execution within timeout"
   - Issue: Scripts fail before reaching execution due to value transfer problems

3. **Dangerous Pattern Detection** (3 failures)
   - `__proto__` usage detection
   - Prototype mutation detection
   - Constructor access detection
   - Issue: Tests expect validation errors, but get execution failures instead

4. **Sandbox API Tests** (3 failures)
   - Safe Math operations
   - Console logging
   - Log message sanitization
   - Issue: Cannot extract outputs from isolated context

5. **Context Isolation Tests** (2 failures)
   - Script context isolation
   - Cross-script data leakage prevention
   - Issue: Unable to verify isolation due to value transfer failures

6. **Injection Prevention Tests** (2 failures)
   - Template literal injection
   - SQL-like injection patterns
   - Issue: Scripts cannot return results for verification

7. **Safe Execution Examples** (3 failures)
   - Mathematical operations
   - Array operations
   - Async operations
   - Issue: All fail at value transfer stage

## Technical Details

### isolated-vm Value Transfer Requirements

The `isolated-vm` library uses V8 isolates which are **completely separate JavaScript contexts**. Values cannot be directly passed between them. Instead, you must:

1. **Primitive values**: Can be copied directly
2. **Objects/Arrays**: Must be serialized and deserialized
3. **Functions**: Must use `ivm.Reference` for callbacks
4. **Complex types**: Require explicit copy/transfer mechanisms

### Current Implementation Issues

**File**: `packages/engine-core/src/scripting/isolated-vm-executor.ts`

#### Issue 1: Output Extraction (Line 102-107)

```typescript
private async extractOutputs(_context: ivm.Context): Promise<Record<string, any>> {
  // Outputs are stored in the context via ctx.script.setOutput
  // For now, return empty object as outputs are collected during execution
  return {};
}
```

**Problem**: Outputs are set inside the isolate but never extracted to the main thread.

**Fix Required**:

- Create a shared `outputStorage` object using `ivm.ExternalCopy`
- Extract outputs after execution using `context.global.get()`
- Properly deserialize values

#### Issue 2: Context Setup (Lines 287-370)

```typescript
await global.set('console', {
  log: new ivm.Reference((message: string) => {
    this.addLog(logs, 'info', String(message), scriptContext.runtime.nodeId);
  }),
  // ...
});
```

**Problem**: Passing closures that reference main thread variables creates transfer issues.

**Fix Required**:

- Use `ivm.Reference` properly with isolated context
- Implement transfer mechanism for log messages
- Use `ivm.ExternalCopy` for data passing

#### Issue 3: Return Value Handling (Line 104)

```typescript
const result = await compiledScript.run(context, {
  timeout,
  promise: true,
});
```

**Problem**: `result` from isolated execution is not properly extracted/deserialized.

**Fix Required**:

- Use `result.copy()` to transfer values from isolate
- Handle primitive vs. object types differently
- Implement proper error handling for non-transferable types

## Security Score Impact

**Current**: 78/100  
**Target**: 95/100  
**Gap**: 17 points

### Scoring Breakdown

| Security Domain      | Current | Target  | Gap | Priority    |
| -------------------- | ------- | ------- | --- | ----------- |
| Sandbox Isolation    | 60/100  | 95/100  | 35  | 🔴 Critical |
| Input Validation     | 85/100  | 95/100  | 10  | 🟡 Medium   |
| Prototype Protection | 100/100 | 100/100 | 0   | ✅ Complete |
| Resource Limits      | 70/100  | 95/100  | 25  | 🔴 Critical |
| Pattern Detection    | 90/100  | 95/100  | 5   | 🟢 Low      |

**Issues Blocking Target Score**:

1. Value transfer failures → Sandbox isolation incomplete
2. Output extraction not working → Cannot verify security guarantees
3. Memory/timeout enforcement untested → Resource limit effectiveness unknown

## Recommended Action Plan

### Phase 1: Fix Value Transfer (2-3 days, HIGH priority)

**Goal**: Get all 30 security tests passing

**Tasks**:

1. ✅ **Fix `extractOutputs()` method**
   - Implement proper value extraction from isolate
   - Use `ivm.ExternalCopy` for output storage
   - Handle primitive, object, and error cases

2. ✅ **Fix context setup**
   - Properly isolate callback references
   - Use message passing for logs instead of closures
   - Implement transfer mechanism for context data

3. ✅ **Fix return value handling**
   - Use `.copy()` for transferable values
   - Implement fallback for complex types
   - Add proper error handling

4. ✅ **Update tests**
   - Fix test expectations for proper value extraction
   - Add tests for value transfer edge cases
   - Verify all 30 tests pass

**Files to Modify**:

- `packages/engine-core/src/scripting/isolated-vm-executor.ts` (primary)
- `packages/engine-core/src/scripting/__tests__/security.test.ts` (verify)

**Acceptance Criteria**:

- [ ] All 30 security tests passing (currently 10/30)
- [ ] No "non-transferable value" errors
- [ ] Outputs properly extracted from isolated context
- [ ] Console logs working correctly
- [ ] Memory and timeout enforcement verified

### Phase 2: Complete Capability Whitelist (1 day, MEDIUM priority)

**Tasks**:

1. Document allowed APIs in security model
2. Implement strict capability checks
3. Add tests for forbidden API access
4. Create API allowlist configuration

**Files to Modify**:

- `packages/engine-core/src/scripting/types.ts` (add capability types)
- `packages/engine-core/src/scripting/isolated-vm-executor.ts` (implement checks)
- `packages/engine-core/docs/security-model.md` (new file)

### Phase 3: Documentation & Integration (1 day, MEDIUM priority)

**Tasks**:

1. Update security model documentation
2. Create user guide for safe script writing
3. Add security examples to docs
4. Update CLAUDE.md with security status

**Files to Create/Modify**:

- `docs/security/script-execution-security.md` (new)
- `docs/api/scripting-api.md` (update)
- `CLAUDE.md` (update status)

### Phase 4: Performance Optimization (Optional, 1 day)

**Tasks**:

1. Optimize isolate pooling
2. Add isolate warmup on startup
3. Implement compile cache for common scripts
4. Benchmark and tune memory limits

## Risk Assessment

### Technical Risks

| Risk                        | Probability | Impact | Mitigation                             |
| --------------------------- | ----------- | ------ | -------------------------------------- |
| isolated-vm incompatibility | Low         | High   | Already integrated, just needs fixes   |
| Performance degradation     | Medium      | Medium | Isolate pooling already implemented    |
| Breaking API changes        | Low         | High   | Tests will catch issues before release |
| Complex debugging           | Medium      | Low    | Comprehensive test suite in place      |

### Timeline Risks

| Milestone          | Estimated | Risk Level | Blocker                 |
| ------------------ | --------- | ---------- | ----------------------- |
| Fix value transfer | 2-3 days  | 🟡 Medium  | Developer availability  |
| Complete tests     | 1 day     | 🟢 Low     | Depends on Phase 1      |
| Documentation      | 1 day     | 🟢 Low     | Can be done in parallel |

**Total Timeline**: 4-5 days of focused development

## Alternative Approaches Considered

### Option 1: Keep Current isolated-vm (RECOMMENDED)

**Pros**:

- Architecture already in place
- True V8 isolation (strongest security)
- Clear separation between sandbox and main thread
- Industry-standard approach

**Cons**:

- Requires value transfer fixes (2-3 days work)
- Slightly more complex than alternatives
- Performance overhead of isolate creation

**Decision**: PROCEED - Best security guarantees, issues are fixable

### Option 2: Use vm2 Library

**Pros**:

- Simpler value passing
- Easier to integrate
- Good for simpler use cases

**Cons**:

- Known sandbox escape vulnerabilities
- Not actively maintained (archived on GitHub)
- Weaker security guarantees than isolated-vm
- Would require full rewrite

**Decision**: REJECT - Security is paramount, vm2 has known issues

### Option 3: Web Workers with Constraints

**Pros**:

- Native browser API
- Good performance
- Built-in message passing

**Cons**:

- Harder to enforce memory/CPU limits
- Still allows some global access
- Requires significant refactoring
- Not suitable for Node.js environments

**Decision**: REJECT - Insufficient security controls

## Dependencies and Blockers

### External Dependencies

- `isolated-vm` package: **v5.0.1** (latest, compatible)
- Node.js: **v20.11.1** (supports isolated-vm)
- No additional dependencies needed

### Internal Dependencies

- Engine Core tests must pass before integration
- Documentation updates after implementation
- No blocking dependencies identified

### Potential Blockers

1. **Developer Availability**: Requires 4-5 focused days
2. **Build System**: isolated-vm requires native compilation (already working)
3. **CI/CD**: Tests must pass in GitHub Actions (isolated-vm currently failing in CI)

**CI Fix Required**: GitHub Actions may need native build tools for isolated-vm

- Current error: `gyp ERR! stack Error: make failed with exit code: 2`
- Solution: Add build-essential to CI runner or use pre-built binaries

## Success Metrics

### Quantitative Metrics

- Security test pass rate: **10/30 → 30/30** (100%)
- Security score: **78 → 95** (+17 points)
- Test coverage: **Current 100%** (maintain)
- Performance: Isolate pool reuse rate **>80%**

### Qualitative Metrics

- No eval() or Function() usage outside sandbox
- All user scripts run in isolated V8 context
- Comprehensive security documentation
- Clear API for safe script development

## Conclusion

The script executor security migration is **well-architected but incompletely implemented**. The use of `isolated-vm` is the correct approach for true sandboxing, but value transfer between the main thread and isolated contexts needs fixes to complete the implementation.

**Recommendation**: **PROCEED with Phase 1** (Fix Value Transfer) as highest priority. This is a 2-3 day effort that will:

- Get all 30 security tests passing
- Achieve 95/100 security score
- Unblock Issue #17 completion
- Provide production-ready script sandboxing

**Next Steps**:

1. Assign developer to Phase 1 (2-3 days)
2. Focus on `isolated-vm-executor.ts` value transfer fixes
3. Verify all tests pass
4. Proceed to Phase 2 (capability whitelist)
5. Complete documentation (Phase 3)

**Timeline to Complete**: 4-5 days of focused development work

---

**Related Issues**:

- #17: Security: Complete script executor security migration
- #18: Security: Sanitize dangerouslySetInnerHTML usage (separate issue)

**References**:

- Audit: `claudedocs/comprehensive-audit-2025-11-14.md`
- Implementation: `packages/engine-core/src/scripting/isolated-vm-executor.ts`
- Tests: `packages/engine-core/src/scripting/__tests__/security.test.ts`
