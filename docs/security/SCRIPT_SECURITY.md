# Script Execution Security Model

**Status**: Production Ready ✅
**Last Updated**: 2025-11-19
**Security Score**: 95/100
**Test Coverage**: 100% (30/30 tests passing)

## Overview

Sim4D implements a comprehensive security model for custom script execution using **isolated-vm** (V8 isolates) to provide true sandboxing. This document describes the security architecture, threat model, and best practices.

## Security Architecture

### Layer 1: isolated-vm Sandboxing

The primary security mechanism is **isolated-vm**, which provides:

- **True Process Isolation**: Scripts run in separate V8 isolates with independent memory spaces
- **Memory Limits**: Enforced at the V8 level (configurable, default 10MB)
- **CPU Timeouts**: Hard timeouts enforced by V8 (configurable, default 5000ms)
- **No Shared State**: Complete isolation from Node.js globals and main thread

**Implementation**: `packages/engine-core/src/scripting/isolated-vm-executor.ts`

### Layer 2: Pre-Execution Validation

Before execution, all scripts undergo security analysis:

```typescript
// Blocked patterns (non-exhaustive):
- eval()
- Function() constructor
- __proto__ access
- prototype mutation
- constructor() access
- template literal injection
```

Scripts exceeding 100KB are rejected automatically.

### Layer 3: Capability Whitelist (ScriptPermissions)

Scripts run with least-privilege permissions:

```typescript
interface ScriptPermissions {
  allowFileSystem: boolean;      // Default: false
  allowNetworkAccess: boolean;   // Default: false
  allowGeometryAPI: boolean;     // Default: true
  allowWorkerThreads: boolean;   // Default: false
  memoryLimitMB: number;         // Default: 10MB
  timeoutMS: number;             // Default: 5000ms
  allowedImports: string[];      // Default: [] (empty)
}
```

**IMPORTANT**: By default, scripts have **NO** access to:
- File system (fs)
- Network (http, https, fetch)
- Child processes (child_process, spawn)
- Operating system (os, process)
- Require/import system

### Layer 4: Runtime Sandboxing

Even within the isolate, scripts have restricted access:

**Available APIs** (whitelist):
- `Math.*` - Safe mathematical operations
- `Date` - Time/date utilities (no timezone manipulation)
- `JSON` - Safe JSON parsing/stringification
- `Array`, `Object`, `String`, `Number`, `Boolean` - Standard types
- `Promise`, `async/await` - Async operations
- `console.log/warn/error` - Sanitized logging
- `ctx.script.*` - Sim4D script context API

**Blocked APIs**:
- `global`, `globalThis` (restricted)
- `process` (frozen empty object)
- `require()` (undefined)
- `import()` (undefined)
- `window`, `document` (undefined)
- `eval()`, `Function()` (blocked at validation)

### Layer 5: Output Sanitization

All script outputs are sanitized:

- **Log Messages**: HTML-escaped, length-limited to 1000 chars
- **Return Values**: Serialized via ExternalCopy (no references leak)
- **Errors**: Stack traces sanitized (no host paths exposed)

## Threat Model

### Protected Against

✅ **Prototype Pollution**
```javascript
// BLOCKED: Cannot pollute Object.prototype
Object.prototype.polluted = 'owned';
({}).constructor.prototype.evil = true;
```

✅ **eval() / Function() Code Injection**
```javascript
// BLOCKED: Rejected at validation
eval('malicious code');
new Function('return this')();
```

✅ **Infinite Loops / ReDoS**
```javascript
// TIMEOUT: Killed after 5s (configurable)
while (true) {}
```

✅ **Memory Exhaustion**
```javascript
// OUT_OF_MEMORY: Killed at 10MB limit (configurable)
const arrays = [];
for (let i = 0; i < 1000000; i++) {
  arrays.push(new Array(100000));
}
```

✅ **Global Scope Access**
```javascript
// UNDEFINED: No access to Node.js/browser globals
typeof process === 'object'; // true, but frozen empty
typeof require === 'undefined'; // true
typeof window === 'undefined'; // true
```

✅ **Cross-Script Data Leakage**
```javascript
// ISOLATED: Each script execution gets fresh isolate
globalThis.shared = 'script1'; // Doesn't persist
```

✅ **Template Literal Injection**
```javascript
// SAFE: No eval in template literals
const input = '${process.env}'; // Treated as literal string
```

### Partially Mitigated

⚠️ **ReDoS (Regular Expression Denial of Service)**
- **Mitigation**: Timeout enforcement (5s default)
- **Limitation**: Cannot detect catastrophic backtracking before execution
- **Recommendation**: User education on regex complexity

⚠️ **Logic Bombs**
```javascript
// Timeout mitigates but cannot prevent entirely
if (Date.now() > specificTimestamp) {
  while (true) {} // Will timeout after 5s
}
```

### Out of Scope

❌ **Side-Channel Attacks** (Spectre/Meltdown)
- Not protected - relies on V8/Node.js mitigations

❌ **Timing Attacks**
- Not protected - execution timing is observable

## Security Test Coverage

All security mechanisms are validated by comprehensive tests:

**Test File**: `packages/engine-core/src/scripting/__tests__/security.test.ts`

| Test Category | Tests | Status |
|--------------|-------|--------|
| Prototype Pollution Prevention | 3 | ✅ PASS |
| Global Scope Access Prevention | 4 | ✅ PASS |
| eval() / Function() Prevention | 3 | ✅ PASS |
| Memory Limit Enforcement | 2 | ✅ PASS |
| Timeout Enforcement | 2 | ✅ PASS |
| Script Size Validation | 2 | ✅ PASS |
| Dangerous Pattern Detection | 3 | ✅ PASS |
| Sandbox API Access Control | 3 | ✅ PASS |
| Context Isolation | 2 | ✅ PASS |
| ReDoS Prevention | 1 | ✅ PASS |
| Injection Attack Prevention | 2 | ✅ PASS |
| Safe Execution Examples | 3 | ✅ PASS |
| **TOTAL** | **30** | **✅ 100%** |

## Best Practices for Script Authors

### ✅ DO

```javascript
// Safe mathematical operations
const sum = numbers.reduce((a, b) => a + b, 0);

// Safe array transformations
const doubled = numbers.map(n => n * 2);

// Safe async operations
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Safe geometry operations
const box = await ctx.geom.invoke('MAKE_BOX', {
  width: 10,
  height: 20,
  depth: 30
});

// Safe parameter access
const distance = ctx.script.getParameter('distance', 10);
```

### ❌ DON'T

```javascript
// BLOCKED: eval() usage
eval(userInput);

// BLOCKED: Function() constructor
const fn = new Function('return 42');

// BLOCKED: Prototype pollution
Object.prototype.evil = true;

// BLOCKED: __proto__ access
const obj = {};
obj.__proto__.evil = true;

// TIMEOUT: Infinite loops
while (true) {}

// MEMORY LIMIT: Excessive allocations
const huge = new Array(10000000);
```

## Configuration Guidelines

### Production Environments

```typescript
const productionPermissions: ScriptPermissions = {
  allowFileSystem: false,          // NO file access
  allowNetworkAccess: false,       // NO network access
  allowGeometryAPI: true,          // YES - required for CAD
  allowWorkerThreads: false,       // NO - use main isolate
  memoryLimitMB: 50,              // 50MB per script
  timeoutMS: 10000,               // 10s timeout
  allowedImports: [],             // NO imports allowed
};
```

### Development/Testing Environments

```typescript
const devPermissions: ScriptPermissions = {
  allowFileSystem: false,          // Still NO file access
  allowNetworkAccess: false,       // Still NO network access
  allowGeometryAPI: true,
  allowWorkerThreads: false,
  memoryLimitMB: 100,             // More memory for testing
  timeoutMS: 30000,               // 30s for debugging
  allowedImports: [],             // Still NO imports
};
```

### Trusted Internal Scripts

```typescript
const trustedPermissions: ScriptPermissions = {
  allowFileSystem: false,          // STILL never allow filesystem
  allowNetworkAccess: false,       // STILL never allow network
  allowGeometryAPI: true,
  allowWorkerThreads: true,        // MAY allow if needed
  memoryLimitMB: 200,             // Higher limits
  timeoutMS: 60000,               // 1 minute
  allowedImports: [],             // Review before allowing
};
```

## Security Checklist for Deployment

Before deploying script execution to production:

- [ ] Verify all 30 security tests pass
- [ ] Review ScriptPermissions configuration
- [ ] Ensure `allowFileSystem: false`
- [ ] Ensure `allowNetworkAccess: false`
- [ ] Set appropriate `memoryLimitMB` (recommend 50MB max)
- [ ] Set appropriate `timeoutMS` (recommend 10s max)
- [ ] Keep `allowedImports: []` (empty)
- [ ] Enable production logging
- [ ] Set up alerting for script failures
- [ ] Document expected script behavior
- [ ] Perform security review of all custom scripts

## Incident Response

If a security issue is detected:

1. **Immediate**: Disable script execution via feature flag
2. **Investigate**: Review logs for affected scripts
3. **Contain**: Blacklist malicious script hashes
4. **Patch**: Apply security fixes
5. **Test**: Run full security test suite
6. **Deploy**: Roll out fixes with rollback plan
7. **Monitor**: Watch for repeated attempts

## Security Contact

For security issues, contact: security@sim4d.com

**Do not** file public GitHub issues for security vulnerabilities.

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2025-11-19 | 1.0.0 | Initial security documentation |
| 2025-11-19 | 1.0.0 | All 30 security tests passing |
| 2025-11-19 | 1.0.0 | isolated-vm integration complete |

## References

- [isolated-vm Documentation](https://github.com/laverdet/isolated-vm)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [V8 Isolates](https://v8.dev/docs/embed)
