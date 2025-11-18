# Horizon 0 Security Migration Plan

**Priority**: P0 - CRITICAL (Blocking for public release)  
**Effort**: 2-3 days  
**Impact**: Prevents code injection, privilege escalation, XSS attacks

## Current Security Issues

### 1. Unsafe eval() Usage (CRITICAL)

**Files Affected**: 2 core files

- `packages/engine-core/src/scripting/script-engine.ts` (line 313)
- `packages/engine-core/src/scripting/javascript-executor.ts` (line 654)

**Current Implementation**:

```typescript
// UNSAFE: script-engine.ts:313
const scriptFunction = new Function('sandbox', `...${script}...`);
const result = scriptFunction(sandbox);

// UNSAFE: javascript-executor.ts:654
new Function(script); // Syntax validation only
```

**Security Risk**:

- Arbitrary code execution in main thread
- Access to global scope and prototypes
- No true isolation from application context
- Potential for prototype pollution
- Memory access outside sandbox

**Attack Vectors**:

1. **Prototype Pollution**: `__proto__`, `constructor.prototype` manipulation
2. **Global Scope Access**: `window`, `document`, `process` access via Function closure
3. **Sandbox Escape**: Breaking out of Object.create(null) sandbox via constructor chain
4. **ReDoS**: Regex denial of service in parameter validation (already fixed)

### 2. Missing CSP Headers

**Current Status**: No Content Security Policy configured

**Required CSP Directives**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' ws: wss:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### 3. HTML Sanitization Gaps

**Current Status**: User inputs not sanitized before rendering

**Attack Surface**:

- Node names and descriptions
- Template metadata
- Console log outputs
- Error messages

## Migration Strategy

### Phase 1: Isolated-VM Integration (Day 1)

**Goal**: Replace Function() constructor with isolated-vm true sandboxing

**Steps**:

1. **Install Dependencies**

```bash
pnpm add isolated-vm
pnpm add -D @types/isolated-vm
```

2. **Create Isolated-VM Executor** (`packages/engine-core/src/scripting/isolated-vm-executor.ts`)

**Key Features**:

- True V8 isolate per script execution
- Memory limit enforcement (10MB default)
- CPU timeout enforcement (5s default)
- No access to Node.js APIs or global scope
- Whitelisted API surface only

3. **Sandbox API Whitelist**:

```typescript
const WHITELISTED_APIS = {
  // Math operations (frozen)
  Math: Object.freeze(Math),

  // Safe console (logged, not executed)
  console: Object.freeze({
    log: (msg: string) => captureLog('info', msg),
    warn: (msg: string) => captureLog('warn', msg),
    error: (msg: string) => captureLog('error', msg),
  }),

  // Script utilities (controlled)
  ctx: Object.freeze({
    script: {
      getInput: (name: string) => validateAndGetInput(name),
      setOutput: (name: string, value: any) => validateAndSetOutput(name, value),
      getParameter: (name: string, defaultValue?: any) =>
        validateAndGetParameter(name, defaultValue),
      createVector: (x: number, y: number, z: number) => createFrozenVector(x, y, z),
    },
  }),

  // Performance monitoring (read-only)
  performance: Object.freeze({
    now: () => performance.now(),
  }),
};
```

4. **Update JavaScriptExecutor**:

- Remove `new Function()` usage completely
- Delegate to isolated-vm for all execution
- Keep syntax validation via esprima/acorn (no execution)

### Phase 2: CSP Headers (Day 2 Morning)

**Implementation Locations**:

1. **Vite Dev Server** (`apps/studio/vite.config.ts`):

```typescript
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': CSP_DIRECTIVES,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
```

2. **Production Build** (`apps/studio/public/_headers` for Netlify/Vercel):

```
/*
  Content-Security-Policy: [CSP_DIRECTIVES]
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
```

3. **Worker Context** (`packages/engine-occt/src/wasm-worker.ts`):

- Verify COOP/COEP headers remain intact
- Add worker-specific CSP for SharedArrayBuffer

### Phase 3: HTML Sanitization (Day 2 Afternoon)

**Install DOMPurify**:

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

**Create Sanitization Utility** (`packages/types/src/sanitization.ts`):

```typescript
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

**Apply Sanitization**:

- Node names and descriptions before rendering
- Template metadata display
- Console logs in UI
- Error messages shown to users
- User-generated content in collaboration features

### Phase 4: Security Testing (Day 3)

**Test Categories**:

1. **Unit Tests** (`packages/engine-core/src/scripting/__tests__/security.test.ts`):

```typescript
describe('Script Security', () => {
  it('should prevent prototype pollution', async () => {
    const malicious = `
      Object.prototype.polluted = 'owned';
      return { result: 'success' };
    `;

    const result = await executor.execute(malicious, ctx, permissions);
    expect(({} as any).polluted).toBeUndefined();
  });

  it('should prevent global scope access', async () => {
    const malicious = `
      return { process: typeof process, window: typeof window };
    `;

    const result = await executor.execute(malicious, ctx, permissions);
    expect(result.outputs.process).toBe('undefined');
    expect(result.outputs.window).toBe('undefined');
  });

  it('should enforce memory limits', async () => {
    const memoryHog = `
      const arrays = [];
      while (true) {
        arrays.push(new Array(1000000).fill(0));
      }
    `;

    await expect(
      executor.execute(memoryHog, ctx, { ...permissions, memoryLimitMB: 1 })
    ).rejects.toThrow('Memory limit exceeded');
  });

  it('should enforce timeouts', async () => {
    const infiniteLoop = `
      while (true) { /* infinite */ }
    `;

    await expect(
      executor.execute(infiniteLoop, ctx, { ...permissions, timeoutMS: 100 })
    ).rejects.toThrow(/timeout/i);
  });
});
```

2. **Integration Tests**:

- Full node execution with malicious scripts
- CSP violation detection
- XSS attempt prevention
- Sanitization verification

3. **Penetration Testing Checklist**:

- [ ] Prototype pollution attempts
- [ ] Sandbox escape via constructor chain
- [ ] Global scope access (process, require, import)
- [ ] DOM access (document, window, localStorage)
- [ ] Memory exhaustion
- [ ] CPU exhaustion (infinite loops)
- [ ] Regex DoS (ReDoS)
- [ ] XSS via node metadata
- [ ] XSS via template content
- [ ] XSS via console logs
- [ ] CSP bypass attempts
- [ ] Worker message injection

## Migration Checklist

### Code Changes

- [ ] Install isolated-vm and types
- [ ] Create IsolatedVMExecutor class
- [ ] Update JavaScriptExecutor to delegate to IsolatedVMExecutor
- [ ] Remove all `new Function()` and `eval()` calls
- [ ] Add CSP headers to Vite config
- [ ] Add CSP headers to production build
- [ ] Install DOMPurify
- [ ] Create sanitization utilities
- [ ] Apply sanitization to all user inputs
- [ ] Update script-engine.ts to use secure executor

### Testing

- [ ] Write security unit tests (15+ test cases)
- [ ] Write integration tests (5+ scenarios)
- [ ] Conduct manual penetration testing
- [ ] Run static security analysis (npm audit, Snyk)
- [ ] Verify CSP headers in dev and prod
- [ ] Test WASM worker isolation

### Documentation

- [ ] Update SECURITY.md with new architecture
- [ ] Document script execution security model
- [ ] Add security guidelines for custom nodes
- [ ] Create penetration testing report
- [ ] Update API docs for ScriptExecutor

### Deployment

- [ ] Test migration in staging environment
- [ ] Verify no breaking changes to existing scripts
- [ ] Update example scripts to follow best practices
- [ ] Add security monitoring/logging
- [ ] Configure CSP reporting endpoint
- [ ] Deploy to production with rollback plan

## Success Criteria

✅ **Zero unsafe eval() calls** - All code execution via isolated-vm  
✅ **CSP enforcement** - All headers configured and validated  
✅ **100% input sanitization** - All user content sanitized  
✅ **All security tests passing** - 15+ tests, 0 failures  
✅ **No CSP violations** - Clean browser console  
✅ **Penetration test report** - No critical vulnerabilities  
✅ **Performance maintained** - < 10ms overhead per script execution

## Rollback Plan

If critical issues arise during migration:

1. **Feature Flag**: Add `FEATURE_ISOLATED_VM` flag
2. **Graceful Degradation**: Fall back to current implementation with warnings
3. **Monitoring**: Track execution failures and security events
4. **Hotfix Process**: Revert to main branch, fix in separate branch
5. **Communication**: Notify users of security maintenance window

## Post-Migration Tasks

- [ ] Monitor CSP violation reports
- [ ] Track script execution performance metrics
- [ ] Set up security incident response process
- [ ] Schedule quarterly security audits
- [ ] Implement automated security scanning in CI/CD
- [ ] Add security awareness to contributor docs

## Timeline

**Day 1** (8 hours):

- 0-2h: Install isolated-vm, create IsolatedVMExecutor
- 2-4h: Update JavaScriptExecutor, remove unsafe code
- 4-6h: Test basic script execution
- 6-8h: Write initial security tests

**Day 2** (8 hours):

- 0-2h: Add CSP headers (dev + prod)
- 2-4h: Install DOMPurify, create sanitization utilities
- 4-6h: Apply sanitization across codebase
- 6-8h: Integration testing

**Day 3** (8 hours):

- 0-4h: Comprehensive penetration testing
- 4-6h: Fix discovered issues
- 6-7h: Documentation updates
- 7-8h: Final validation and deployment prep

**Total**: 24 hours (3 full days)

## Risk Assessment

| Risk                      | Likelihood | Impact | Mitigation                                          |
| ------------------------- | ---------- | ------ | --------------------------------------------------- |
| Performance degradation   | Medium     | Medium | Benchmark before/after, optimize isolate creation   |
| Breaking existing scripts | Low        | High   | Comprehensive testing, backward compatibility layer |
| CSP too restrictive       | Medium     | Low    | Gradual CSP tightening, report-only mode first      |
| isolated-vm instability   | Low        | High   | Fallback to current implementation via feature flag |
| Timeline overrun          | Medium     | Medium | Prioritize P0 items, defer nice-to-haves            |

## References

- [isolated-vm Documentation](https://github.com/laverdet/isolated-vm)
- [OWASP Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
