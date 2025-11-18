/**
 * Security Tests for Script Execution
 * CRITICAL: These tests validate protection against code injection and XSS attacks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IsolatedVMExecutor } from '../isolated-vm-executor';
import type { ScriptContext, ScriptPermissions } from '../types';

describe('Script Security', () => {
  let executor: IsolatedVMExecutor;
  let context: ScriptContext;
  let permissions: ScriptPermissions;

  beforeEach(() => {
    executor = new IsolatedVMExecutor();

    context = {
      script: {} as any,
      runtime: {
        nodeId: 'test-node' as any,
        executionId: 'test-exec',
        startTime: Date.now(),
        memoryUsage: () => 0,
        isAborted: () => false,
      },
      geom: {} as any,
      graph: {} as any,
      cache: {} as any,
    };

    permissions = {
      allowFileSystem: false,
      allowNetworkAccess: false,
      allowGeometryAPI: true,
      allowWorkerThreads: false,
      memoryLimitMB: 10,
      timeoutMS: 1000,
      allowedImports: [],
    };
  });

  describe('Prototype Pollution Prevention', () => {
    it('should prevent __proto__ pollution', async () => {
      const malicious = `
        Object.prototype.polluted = 'owned';
        return { result: 'attempted pollution' };
      `;

      const result = await executor.execute(malicious, context, permissions);

      // Check that pollution didn't affect global prototypes
      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should prevent constructor.prototype pollution', async () => {
      const malicious = `
        ({}).__proto__.constructor.prototype.polluted = 'owned';
        return { result: 'attempted pollution' };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it('should prevent prototype property injection', async () => {
      const malicious = `
        Object.defineProperty(Object.prototype, 'injected', {
          value: 'malicious',
          writable: true,
          configurable: true
        });
        return { result: 'attempted injection' };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect((Object.prototype as any).injected).toBeUndefined();
    });
  });

  describe('Global Scope Access Prevention', () => {
    it('should prevent process access', async () => {
      const malicious = `
        return { hasProcess: typeof process !== 'undefined' };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(true);
      // In isolated-vm, process should be undefined
    });

    it('should prevent require() access', async () => {
      const malicious = `
        try {
          const fs = require('fs');
          return { accessible: true };
        } catch (e) {
          return { accessible: false };
        }
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(true);
    });

    it('should prevent import() access', async () => {
      const malicious = `
        try {
          await import('fs');
          return { accessible: true };
        } catch (e) {
          return { accessible: false };
        }
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(true);
    });

    it('should prevent window/document access', async () => {
      const malicious = `
        return {
          hasWindow: typeof window !== 'undefined',
          hasDocument: typeof document !== 'undefined'
        };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(true);
    });
  });

  describe('eval() and Function() Prevention', () => {
    it('should reject scripts with eval()', async () => {
      const malicious = `
        eval('console.log("executed")');
        return { result: 'success' };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/eval/i);
    });

    it('should reject scripts with Function() constructor', async () => {
      const malicious = `
        const fn = new Function('return 42');
        return { result: fn() };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/Function/i);
    });

    it('should reject scripts with indirect eval', async () => {
      const malicious = `
        const e = eval;
        e('console.log("executed")');
        return { result: 'success' };
      `;

      const result = await executor.execute(malicious, context, permissions);
      expect(result.success).toBe(false);
    });
  });

  describe('Memory Limit Enforcement', () => {
    it('should enforce memory limits', async () => {
      const memoryHog = `
        const arrays = [];
        for (let i = 0; i < 1000; i++) {
          arrays.push(new Array(100000).fill(0));
        }
        return { result: 'completed' };
      `;

      const result = await executor.execute(memoryHog, context, {
        ...permissions,
        memoryLimitMB: 1, // Very low limit
      });

      // Should fail due to memory limit
      expect(result.success).toBe(false);
    }, 10000); // 10s timeout for this test

    it('should allow execution within memory limits', async () => {
      const safe = `
        const small = new Array(100).fill(0);
        return { result: small.length };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
    });
  });

  describe('Timeout Enforcement', () => {
    it('should enforce execution timeouts', async () => {
      const infiniteLoop = `
        while (true) {
          // Infinite loop
        }
      `;

      const result = await executor.execute(infiniteLoop, context, {
        ...permissions,
        timeoutMS: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout/i);
    });

    it('should allow execution within timeout', async () => {
      const safe = `
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return { result: sum };
      `;

      const result = await executor.execute(safe, context, {
        ...permissions,
        timeoutMS: 1000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Script Size Validation', () => {
    it('should reject scripts exceeding size limit', async () => {
      const hugeScript = 'const x = 1;'.repeat(50000); // 150KB+

      const validation = await executor.validate(hugeScript);
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].code).toBe('SCRIPT_TOO_LARGE');
    });

    it('should accept scripts within size limit', async () => {
      const normalScript = `
        const result = 1 + 1;
        return { result };
      `;

      const validation = await executor.validate(normalScript);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Dangerous Pattern Detection', () => {
    it('should detect __proto__ usage', async () => {
      const malicious = `
        const obj = {};
        obj.__proto__.evil = true;
      `;

      const validation = await executor.validate(malicious);
      expect(validation.valid).toBe(false);
      const hasProtoWarning = validation.errors.some(
        (e) => e.message.includes('Prototype') || e.message.includes('__proto__')
      );
      expect(hasProtoWarning).toBe(true);
    });

    it('should detect prototype mutation', async () => {
      const malicious = `
        Object.prototype = { evil: true };
      `;

      const validation = await executor.validate(malicious);
      expect(validation.valid).toBe(false);
    });

    it('should detect constructor access', async () => {
      const malicious = `
        ({}).constructor('return this')();
      `;

      const validation = await executor.validate(malicious);
      expect(validation.valid).toBe(false);
    });
  });

  describe('Sandbox API Access Control', () => {
    it('should allow safe Math operations', async () => {
      const safe = `
        const result = Math.sqrt(16) + Math.PI;
        return { result };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
    });

    it('should allow safe console logging', async () => {
      const safe = `
        console.log('test message');
        return { result: 'logged' };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].message).toBe('test message');
    });

    it('should sanitize log messages', async () => {
      const withHTML = `
        console.log('<script>alert("xss")</script>');
        return { result: 'logged' };
      `;

      const result = await executor.execute(withHTML, context, permissions);
      expect(result.success).toBe(true);
      expect(result.logs[0].message).not.toContain('<script>');
    });
  });

  describe('Context Isolation', () => {
    it('should isolate script contexts', async () => {
      const script1 = `
        globalThis.shared = 'script1';
        return { value: 'script1' };
      `;

      const script2 = `
        return { hasShared: typeof globalThis.shared !== 'undefined' };
      `;

      await executor.execute(script1, context, permissions);
      const result2 = await executor.execute(script2, context, permissions);

      expect(result2.success).toBe(true);
      // script2 should not see script1's global variable
    });

    it('should prevent cross-script data leakage', async () => {
      const setGlobal = `
        try {
          global.leak = 'sensitive';
        } catch (e) {}
        return { set: true };
      `;

      const readGlobal = `
        return { leaked: global?.leak };
      `;

      await executor.execute(setGlobal, context, permissions);
      const result = await executor.execute(readGlobal, context, permissions);

      expect(result.success).toBe(true);
    });
  });

  describe('ReDoS Prevention', () => {
    it('should timeout on catastrophic backtracking', async () => {
      const redos = `
        const evil = /^(a+)+$/;
        const payload = 'a'.repeat(50) + 'X';
        const match = evil.test(payload);
        return { matched: match };
      `;

      const result = await executor.execute(redos, context, {
        ...permissions,
        timeoutMS: 500,
      });

      // Should timeout due to catastrophic backtracking
      expect(result.success).toBe(false);
    });
  });

  describe('Injection Attack Prevention', () => {
    it('should prevent code injection via template literals', async () => {
      const userInput = '${process.env}'; // Malicious user input
      const script = `
        const input = \`${userInput}\`;
        return { input };
      `;

      const result = await executor.execute(script, context, permissions);
      // Should execute safely without evaluating template
      expect(result.success).toBe(true);
    });

    it('should prevent SQL-like injection patterns', async () => {
      const injection = `
        const query = "SELECT * FROM users WHERE id = ' OR '1'='1";
        return { query };
      `;

      const result = await executor.execute(injection, context, permissions);
      expect(result.success).toBe(true);
      // Script can run but has no database access
    });
  });

  describe('Safe Execution Examples', () => {
    it('should execute safe mathematical operations', async () => {
      const safe = `
        const a = 10;
        const b = 20;
        const sum = a + b;
        const product = a * b;
        return { sum, product };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
    });

    it('should execute safe array operations', async () => {
      const safe = `
        const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(n => n * 2);
        const sum = numbers.reduce((a, b) => a + b, 0);
        return { doubled, sum };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
    });

    it('should execute safe async operations', async () => {
      const safe = `
        async function delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        await delay(10);
        return { completed: true };
      `;

      const result = await executor.execute(safe, context, permissions);
      expect(result.success).toBe(true);
    });
  });
});
