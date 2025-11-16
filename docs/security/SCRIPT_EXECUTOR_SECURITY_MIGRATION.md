# Script Executor Security Migration Plan

**Status**: CRITICAL - IN PROGRESS
**Priority**: P0 (Blocks Production Deployment)
**Issue**: CVE-2025-BREPFLOW-001 - Arbitrary Code Execution via Function() Constructor

---

## Problem Summary

The `JavaScriptExecutor` class uses the `Function()` constructor for dynamic script execution, which allows arbitrary code execution and sandbox escape. This is a **CRITICAL security vulnerability** (CVSS 9.8) that must be fixed before production deployment.

**Vulnerable Code**:

```typescript
// Line 102 (validate method)
new Function(script); // Syntax validation - UNSAFE

// Lines 226-227, 513-514 (extractNodeDefinition, executeInSecureContext)
const scriptFunction = new Function('return ' + wrappedScript)();
return scriptFunction(...sandboxValues); // Arbitrary code execution - UNSAFE
```

---

## Immediate Actions Taken (2025-11-13)

### ✅ Phase 1: Defensive Measures Implemented

1. **Script Size Limit**: 100KB maximum
2. **Blacklist System**: Track and block malicious scripts by hash
3. **Pattern Detection**: Block dangerous patterns (eval, Function, **proto**, etc.)
4. **CSP Compliance Check**: Validate against Content Security Policy
5. **Input Sanitization**: Validate and sanitize all script inputs
6. **Frozen Sandbox**: Use Object.freeze() to prevent prototype pollution

7. **Temporary Execution Block**:
   - `extractNodeDefinition()` now returns `null` (breaks functionality but prevents exploits)
   - `executeInSecureContext()` rejects with error until secure implementation ready

---

## Required Actions for Production

### Phase 2: Secure Execution Environment (REQUIRED)

**Timeline**: 1-2 weeks
**Owner**: Backend/Security Team

#### Option A: isolated-vm (Recommended for Node.js)

```bash
# Install isolated-vm
pnpm add isolated-vm
```

```typescript
import ivm from 'isolated-vm';

private async executeInSecureContext(
  script: string,
  sandbox: any,
  context: ScriptContext,
  permissions: ScriptPermissions,
  signal: AbortSignal
): Promise<{ outputs: any; memoryUsage: number }> {
  // Create isolated VM instance
  const isolate = new ivm.Isolate({
    memoryLimit: 128, // MB
    inspector: false, // Disable debugging in production
  });

  try {
    const context = await isolate.createContext();

    // Transfer sandbox to isolated context
    await context.global.set('ctx', new ivm.ExternalCopy(sandbox.ctx).copyInto());
    await context.global.set('console', new ivm.ExternalCopy(sandbox.console).copyInto());
    await context.global.set('Math', new ivm.ExternalCopy(Math).copyInto());

    // Compile script
    const compiled = await isolate.compileScript(script);

    // Execute with timeout
    const result = await compiled.run(context, {
      timeout: permissions.timeoutMS,
      release: false,
    });

    return {
      outputs: result || {},
      memoryUsage: isolate.getHeapStatisticsSync().used_heap_size,
    };
  } finally {
    isolate.dispose();
  }
}
```

**Pros**:

- True isolation (separate V8 context)
- Memory limits enforced at VM level
- Production-grade security
- No access to Node.js APIs

**Cons**:

- Node.js only (doesn't work in browser)
- Native dependency (requires compilation)
- Higher memory overhead

#### Option B: Web Worker (Recommended for Browser)

```typescript
// Create worker file: packages/engine-core/src/scripting/sandbox-worker.ts
self.addEventListener('message', async (e) => {
  const { script, sandbox, timeout } = e.data;

  try {
    // Execute script in worker context (isolated from main thread)
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const func = new AsyncFunction('ctx', 'Math', 'console', script);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    });

    const result = await Promise.race([
      func(sandbox.ctx, Math, sandbox.console),
      timeoutPromise
    ]);

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// In main thread:
private async executeInSecureContext(
  script: string,
  sandbox: any,
  context: ScriptContext,
  permissions: ScriptPermissions,
  signal: AbortSignal
): Promise<{ outputs: any; memoryUsage: number }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./sandbox-worker.ts', import.meta.url));

    const timeoutHandle = setTimeout(() => {
      worker.terminate();
      reject(new Error('Worker timeout'));
    }, permissions.timeoutMS);

    worker.onmessage = (e) => {
      clearTimeout(timeoutHandle);
      worker.terminate();

      if (e.data.success) {
        resolve({
          outputs: e.data.result || {},
          memoryUsage: 0,
        });
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (error) => {
      clearTimeout(timeoutHandle);
      worker.terminate();
      reject(error);
    };

    worker.postMessage({ script, sandbox, timeout: permissions.timeoutMS });
  });
}
```

**Pros**:

- Works in browser
- True thread isolation
- Can terminate on timeout
- Standard web API

**Cons**:

- Still uses Function() (but in isolated worker)
- Can't share complex objects (serialization required)
- Worker overhead for each execution

#### Option C: Quick-JS (Lightweight Alternative)

```bash
pnpm add quickjs-emscripten
```

```typescript
import { getQuickJS } from 'quickjs-emscripten';

private async executeInSecureContext(
  script: string,
  sandbox: any,
  context: ScriptContext,
  permissions: ScriptPermissions,
  signal: AbortSignal
): Promise<{ outputs: any; memoryUsage: number }> {
  const QuickJS = await getQuickJS();
  const vm = QuickJS.newContext();

  try {
    // Set memory limit
    vm.runtime.setMemoryLimit(128 * 1024 * 1024); // 128MB
    vm.runtime.setMaxStackSize(512 * 1024); // 512KB

    // Transfer sandbox
    const ctxHandle = vm.newObject();
    // ... populate ctxHandle with sandbox values ...
    vm.setProp(vm.global, 'ctx', ctxHandle);

    // Execute with timeout
    const result = vm.evalCode(script, 'user-script.js', {
      compileTimeout: 1000,
      evalTimeout: permissions.timeoutMS,
    });

    if (result.error) {
      throw new Error(vm.dump(result.error));
    }

    return {
      outputs: vm.dump(result.value) || {},
      memoryUsage: vm.runtime.computeMemoryUsage().memoryUsed,
    };
  } finally {
    vm.dispose();
  }
}
```

**Pros**:

- Lightweight (200KB)
- Works in browser and Node.js
- ES2020 support
- Memory limits

**Cons**:

- Not full ES2022 support
- Smaller ecosystem
- Less battle-tested

---

### Phase 3: Additional Security Hardening (RECOMMENDED)

**Timeline**: Additional 1 week

1. **Content Security Policy Headers**

   ```typescript
   // apps/studio/vite.config.production.ts
   headers: {
     'Content-Security-Policy': [
       "default-src 'self'",
       "script-src 'self' 'wasm-unsafe-eval'", // For WASM, no unsafe-eval
       "worker-src 'self' blob:",
       "connect-src 'self' https://api.brepflow.com",
       "style-src 'self' 'unsafe-inline'", // Minimize inline styles
     ].join('; '),
   }
   ```

2. **AST-Based Validation** (instead of regex)

   ```bash
   pnpm add acorn
   ```

   ```typescript
   import * as acorn from 'acorn';

   private validateScriptSyntax(script: string): void {
     try {
       const ast = acorn.parse(script, {
         ecmaVersion: 2022,
         sourceType: 'script',
       });

       // Traverse AST to detect dangerous patterns
       this.validateAST(ast);
     } catch (error) {
       throw new SyntaxError(error.message);
     }
   }

   private validateAST(node: any): void {
     // Detect Function() constructor
     if (node.type === 'NewExpression' &&
         node.callee?.name === 'Function') {
       throw new Error('Function() constructor not allowed');
     }

     // Detect eval()
     if (node.type === 'CallExpression' &&
         node.callee?.name === 'eval') {
       throw new Error('eval() not allowed');
     }

     // Detect __proto__ access
     if (node.type === 'MemberExpression' &&
         node.property?.name === '__proto__') {
       throw new Error('Prototype manipulation not allowed');
     }

     // Recursively validate children
     for (const key in node) {
       if (node[key] && typeof node[key] === 'object') {
         if (Array.isArray(node[key])) {
           node[key].forEach(this.validateAST.bind(this));
         } else if (node[key].type) {
           this.validateAST(node[key]);
         }
       }
     }
   }
   ```

3. **Runtime Monitoring**

   ```typescript
   private async executeWithMonitoring(
     script: string,
     sandbox: any,
     permissions: ScriptPermissions
   ): Promise<any> {
     const metrics = {
       startTime: performance.now(),
       memoryBefore: performance.memory?.usedJSHeapSize || 0,
       cpuBefore: process.cpuUsage?.() || { user: 0, system: 0 },
     };

     try {
       const result = await this.executeInSecureContext(script, sandbox, ...);

       const endTime = performance.now();
       const memoryAfter = performance.memory?.usedJSHeapSize || 0;
       const cpuAfter = process.cpuUsage?.() || { user: 0, system: 0 };

       // Log suspicious behavior
       if (endTime - metrics.startTime > permissions.timeoutMS * 0.9) {
         console.warn('Script near timeout threshold', { script: script.substring(0, 100) });
       }

       if (memoryAfter - metrics.memoryBefore > 50 * 1024 * 1024) {
         console.warn('Script high memory usage', {
           memoryDelta: memoryAfter - metrics.memoryBefore
         });
       }

       return result;
     } catch (error) {
       // Log execution failures for security monitoring
       this.logSecurityEvent('script_execution_failed', {
         script: script.substring(0, 100),
         error: error.message,
       });
       throw error;
     }
   }
   ```

4. **Script Signing** (for plugin marketplace)

   ```typescript
   async function verifyScriptSignature(
     script: string,
     signature: string,
     publicKey: string
   ): Promise<boolean> {
     const encoder = new TextEncoder();
     const data = encoder.encode(script);
     const signatureBytes = Buffer.from(signature, 'base64');
     const publicKeyObj = await crypto.subtle.importKey(
       'spki',
       Buffer.from(publicKey, 'base64'),
       { name: 'ECDSA', namedCurve: 'P-256' },
       false,
       ['verify']
     );

     return crypto.subtle.verify(
       { name: 'ECDSA', hash: 'SHA-256' },
       publicKeyObj,
       signatureBytes,
       data
     );
   }
   ```

---

## Testing Requirements

### Unit Tests

```typescript
// packages/engine-core/src/scripting/__tests__/javascript-executor.security.test.ts
describe('JavaScriptExecutor Security', () => {
  let executor: JavaScriptExecutor;

  beforeEach(() => {
    executor = new JavaScriptExecutor();
  });

  it('should reject Function() constructor', async () => {
    const script = 'const x = new Function("alert(1)");';
    const result = await executor.validate(script);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'SECURITY_FUNCTION_CONSTRUCTOR' })
    );
  });

  it('should reject eval()', async () => {
    const script = 'eval("malicious code");';
    const result = await executor.validate(script);
    expect(result.valid).toBe(false);
  });

  it('should reject __proto__ access', async () => {
    const script = 'Object.prototype.__proto__ = {};';
    const result = await executor.validate(script);
    expect(result.valid).toBe(false);
  });

  it('should reject scripts over size limit', async () => {
    const script = 'x'.repeat(100001);
    const result = await executor.validate(script);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('SCRIPT_TOO_LARGE');
  });

  it('should blacklist malicious scripts', async () => {
    const script = 'eval("bad")';
    await executor.execute(script, mockContext, mockPermissions);

    // Second attempt should be blocked by blacklist
    const result = await executor.execute(script, mockContext, mockPermissions);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('previously flagged as malicious');
  });

  it('should enforce memory limits in sandbox', async () => {
    // Requires isolated-vm or QuickJS
    const script = `
      const huge = new Array(1000000).fill('x'.repeat(1000));
      return huge;
    `;

    await expect(executor.execute(script, mockContext, mockPermissions)).rejects.toThrow(
      /memory limit/i
    );
  });

  it('should enforce timeout limits', async () => {
    const script = `
      while(true) {} // Infinite loop
    `;

    const result = await executor.execute(script, mockContext, {
      ...mockPermissions,
      timeoutMS: 1000,
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('timeout');
  });
});
```

### Penetration Testing

```typescript
describe('Penetration Tests', () => {
  it('cannot escape sandbox via prototype chain', async () => {
    const script = `
      Object.prototype.toString = () => "pwned";
      return {};
    `;

    const result = await executor.execute(script, mockContext, mockPermissions);
    expect(Object.prototype.toString()).not.toBe('pwned');
  });

  it('cannot access process object', async () => {
    const script = `
      return typeof process !== 'undefined' ? process.env : null;
    `;

    const result = await executor.execute(script, mockContext, mockPermissions);
    expect(result.outputs).not.toHaveProperty('env');
  });

  it('cannot require Node.js modules', async () => {
    const script = `const fs = require('fs'); return fs;`;
    const result = await executor.validate(script);
    expect(result.valid).toBe(false);
  });
});
```

---

## Migration Checklist

- [ ] **Phase 1: Defensive Measures** ✅ COMPLETE (2025-11-13)
  - [x] Add script size limits
  - [x] Implement blacklist system
  - [x] Add pattern detection
  - [x] Freeze sandbox objects
  - [x] Disable unsafe execution temporarily

- [ ] **Phase 2: Secure Execution** (Week 1-2)
  - [ ] Choose secure execution method (isolated-vm vs worker vs quickjs)
  - [ ] Install and configure chosen solution
  - [ ] Implement secure `executeInSecureContext()`
  - [ ] Implement secure `extractNodeDefinition()`
  - [ ] Test basic script execution
  - [ ] Migrate existing scripts to new format
  - [ ] Update documentation

- [ ] **Phase 3: Advanced Security** (Week 3)
  - [ ] Implement AST-based validation (acorn)
  - [ ] Add CSP headers to production build
  - [ ] Implement runtime monitoring
  - [ ] Add script signing for plugins
  - [ ] Complete security test suite
  - [ ] Penetration testing

- [ ] **Phase 4: Production Hardening** (Week 4)
  - [ ] Security audit by external team
  - [ ] Performance benchmarking
  - [ ] Load testing with concurrent scripts
  - [ ] Memory leak testing
  - [ ] Rollout plan and monitoring
  - [ ] Documentation and training

---

## Success Criteria

1. **No Function() or eval() usage** in script execution path
2. **True VM isolation** (separate memory space, no prototype access)
3. **Memory limits enforced** at VM level (128MB max)
4. **Timeout enforcement** with worker termination (<5s max)
5. **All security tests pass** (unit + penetration)
6. **Zero regressions** in existing script functionality
7. **Performance acceptable** (<100ms overhead vs unsafe Function())

---

## Resources

- [isolated-vm Documentation](https://github.com/laverdet/isolated-vm)
- [QuickJS-Emscripten](https://github.com/justjake/quickjs-emscripten)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [OWASP Code Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
- [V8 Isolates](https://v8.dev/docs/embed)

---

**Last Updated**: 2025-11-13
**Next Review**: After Phase 2 completion (2 weeks)
**Contact**: security@brepflow.com
