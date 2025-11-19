/**
 * Isolated-VM Script Executor
 * TRUE sandboxing using V8 isolates - no prototype pollution, no global access
 *
 * SECURITY: This replaces all unsafe eval() and Function() usage
 */

import ivm from 'isolated-vm';
import {
  ScriptExecutor,
  ScriptContext,
  ScriptPermissions,
  ScriptExecutionResult,
  ScriptValidationResult,
  ScriptError,
  ScriptLogEntry,
  ScriptMetric,
  ScriptExecutionError,
  AutoCompletionItem,
  SyntaxHighlightRules,
  LanguageDocumentation,
} from './types';

export class IsolatedVMExecutor implements ScriptExecutor {
  private static readonly DEFAULT_MEMORY_LIMIT_MB = 10;
  private static readonly DEFAULT_TIMEOUT_MS = 5000;
  private static readonly MAX_SCRIPT_SIZE = 100000; // 100KB

  // Isolate pool for reuse (performance optimization)
  private isolatePool: ivm.Isolate[] = [];
  private readonly MAX_POOL_SIZE = 3;

  async execute(
    script: string,
    context: ScriptContext,
    permissions: ScriptPermissions
  ): Promise<ScriptExecutionResult> {
    const startTime = performance.now();
    const logs: ScriptLogEntry[] = [];
    const metrics: ScriptMetric[] = [];

    // SECURITY: Pre-execution validation
    const securityCheck = this.performSecurityChecks(script);
    if (!securityCheck.passed) {
      return {
        success: false,
        outputs: {},
        logs,
        metrics,
        executionTime: 0,
        memoryUsage: 0,
        error: new Error(`Security check failed: ${securityCheck.reason}`),
      };
    }

    let isolate: ivm.Isolate | null = null;
    let isolateContext: ivm.Context | null = null;

    try {
      // Get or create isolate
      isolate = this.getIsolate(permissions.memoryLimitMB);

      // Create context within isolate
      isolateContext = await isolate.createContext();

      // Set up secure sandbox environment
      try {
        await this.setupSecureSandbox(isolateContext, context, logs, metrics);
      } catch (error) {
        throw new Error(`Sandbox setup failed: ${(error as Error).message}`);
      }

      // Wrap script in async function for proper execution
      const wrappedScript = this.wrapScript(script);

      // Compile script
      let compiledScript;
      try {
        compiledScript = await isolate.compileScript(wrappedScript);
      } catch (error) {
        throw new Error(`Script compilation failed: ${(error as Error).message}`);
      }

      // Execute with timeout and memory limits
      let scriptResult;
      try {
        scriptResult = await this.executeWithLimits(
          compiledScript,
          isolateContext,
          permissions.timeoutMS
        );
      } catch (error) {
        throw new Error(`Script execution failed: ${(error as Error).message}`);
      }

      // Release the script result reference if it exists
      // (the script's return value is a Reference that needs cleanup)
      try {
        if (scriptResult && typeof scriptResult.release === 'function') {
          scriptResult.release();
        }
      } catch (error) {
        throw new Error(`Script result cleanup failed: ${(error as Error).message}`);
      }

      // Extract outputs from execution result
      let outputs;
      try {
        outputs = await this.extractOutputs(isolateContext);
      } catch (error) {
        throw new Error(`Output extraction failed: ${(error as Error).message}`);
      }

      // Extract logs from isolate
      try {
        await this.extractLogs(isolateContext, logs, context.runtime.nodeId);
      } catch (error) {
        throw new Error(`Log extraction failed: ${(error as Error).message}`);
      }

      return {
        success: true,
        outputs,
        logs,
        metrics,
        executionTime: performance.now() - startTime,
        memoryUsage: isolate.getHeapStatistics().used_heap_size,
      };
    } catch (error) {
      return {
        success: false,
        outputs: {},
        logs,
        metrics,
        executionTime: performance.now() - startTime,
        memoryUsage: isolate?.getHeapStatistics().used_heap_size || 0,
        error: this.normalizeError(error, context.runtime.nodeId),
      };
    } finally {
      // Return isolate to pool or dispose
      if (isolate) {
        this.returnIsolate(isolate);
      }
    }
  }

  async validate(script: string): Promise<ScriptValidationResult> {
    const errors: ScriptError[] = [];
    const warnings: ScriptError[] = [];

    // SECURITY: Size check
    if (script.length > IsolatedVMExecutor.MAX_SCRIPT_SIZE) {
      errors.push({
        line: 1,
        column: 1,
        message: `Script exceeds maximum size of ${IsolatedVMExecutor.MAX_SCRIPT_SIZE} characters`,
        severity: 'error',
        code: 'SCRIPT_TOO_LARGE',
      });
      return { valid: false, errors, warnings, suggestedFixes: [] };
    }

    // Security analysis
    const securityIssues = this.analyzeSecurityConcerns(script);
    warnings.push(...securityIssues);

    // Syntax validation using isolate (safe - no execution)
    let isolate: ivm.Isolate | null = null;
    try {
      isolate = new ivm.Isolate({ memoryLimit: 8 }); // Small isolate for validation
      const wrappedScript = this.wrapScript(script);

      // Compilation validates syntax without executing
      await isolate.compileScript(wrappedScript);
    } catch (error) {
      const syntaxError = this.parseSyntaxError(error);
      if (syntaxError) {
        errors.push(syntaxError);
      }
    } finally {
      if (isolate) {
        isolate.dispose();
      }
    }

    // Best practices analysis
    const practiceIssues = this.analyzeBestPractices(script);
    warnings.push(...practiceIssues);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestedFixes: [],
    };
  }

  async compile(script: string): Promise<any> {
    const isolate = new ivm.Isolate({ memoryLimit: 8 });
    try {
      const wrappedScript = this.wrapScript(script);
      await isolate.compileScript(wrappedScript);

      // Note: Compiled scripts cannot be transferred between isolates
      // This is returned for validation purposes only
      return { compiled: true };
    } finally {
      isolate.dispose();
    }
  }

  getSyntaxHighlighting(): SyntaxHighlightRules {
    return {
      keywords: [
        'const',
        'let',
        'var',
        'function',
        'return',
        'if',
        'else',
        'for',
        'while',
        'do',
        'break',
        'continue',
        'switch',
        'case',
        'default',
        'try',
        'catch',
        'finally',
        'throw',
        'class',
        'extends',
        'async',
        'await',
        'true',
        'false',
        'null',
        'undefined',
        'typeof',
        'instanceof',
        'new',
        'this',
      ],
      operators: [
        '+',
        '-',
        '*',
        '/',
        '%',
        '**',
        '=',
        '==',
        '===',
        '!=',
        '!==',
        '<',
        '>',
        '<=',
        '>=',
        '&&',
        '||',
        '!',
        '&',
        '|',
        '^',
        '~',
        '<<',
        '>>',
        '>>>',
        '?',
        ':',
        '++',
        '--',
      ],
      builtins: [
        'console',
        'Math',
        'Date',
        'JSON',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
        'Promise',
        'Set',
        'Map',
      ],
      comments: [/\/\/.*$/, /\/\*[\s\S]*?\*\//],
      strings: [/"(?:[^"\\]|\\[\s\S])*?"/, /'(?:[^'\\]|\\[\s\S])*?'/, /`(?:[^`\\]|\\[\s\S])*?`/],
      numbers: [/\b\d+\.\d+\b/, /\b\d+\b/, /\b0[xX][0-9a-fA-F]+\b/],
    };
  }

  async getAutoCompletion(
    _script: string,
    _position: { line: number; column: number }
  ): Promise<AutoCompletionItem[]> {
    // Return context-aware completions
    return [
      {
        label: 'ctx.script.getInput',
        kind: 'function',
        detail: '<T>(name: string) => T | undefined',
        documentation: 'Get input value by name',
        insertText: 'ctx.script.getInput($1)',
      },
      {
        label: 'ctx.script.setOutput',
        kind: 'function',
        detail: '(name: string, value: any) => void',
        documentation: 'Set output value by name',
        insertText: 'ctx.script.setOutput($1, $2)',
      },
      {
        label: 'ctx.script.getParameter',
        kind: 'function',
        detail: '<T>(name: string, defaultValue?: T) => T',
        documentation: 'Get parameter value with optional default',
        insertText: 'ctx.script.getParameter($1)',
      },
    ];
  }

  async formatCode(script: string): Promise<string> {
    // Basic formatting - could integrate with Prettier
    return script
      .replace(/;\s*\n/g, ';\n')
      .replace(/\{\s*\n/g, '{\n  ')
      .replace(/\n\s*\}/g, '\n}');
  }

  getLanguageDocumentation(): LanguageDocumentation {
    return {
      name: 'JavaScript (Isolated)',
      version: 'ES2022',
      description: 'Secure JavaScript environment using V8 isolates',
      quickStart: `
// Basic node script structure
async function evaluate(ctx, inputs, params) {
  const shape = ctx.script.getInput('shape');
  const distance = ctx.script.getParameter('distance', 10);

  const result = await ctx.geom.invoke('MAKE_EXTRUDE', {
    face: shape,
    distance: distance
  });

  ctx.script.setOutput('result', result);
  return { result };
}
      `,
      apiReference: [],
      examples: [],
      troubleshooting: [],
    };
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Get isolate from pool or create new one
   */
  private getIsolate(memoryLimitMB: number): ivm.Isolate {
    // Try to reuse from pool
    const pooledIsolate = this.isolatePool.pop();
    if (pooledIsolate) {
      return pooledIsolate;
    }

    // Create new isolate with memory limit
    return new ivm.Isolate({
      memoryLimit: memoryLimitMB || IsolatedVMExecutor.DEFAULT_MEMORY_LIMIT_MB,
    });
  }

  /**
   * Return isolate to pool or dispose
   */
  private returnIsolate(isolate: ivm.Isolate): void {
    if (this.isolatePool.length < this.MAX_POOL_SIZE) {
      this.isolatePool.push(isolate);
    } else {
      isolate.dispose();
    }
  }

  /**
   * Set up secure sandbox environment in isolate context
   */
  private async setupSecureSandbox(
    context: ivm.Context,
    scriptContext: ScriptContext,
    logs: ScriptLogEntry[],
    _metrics: ScriptMetric[]
  ): Promise<void> {
    // Create storage objects within the isolate for outputs and logs
    await context.eval('globalThis.__outputs__ = {}');
    await context.eval('globalThis.__logs__ = []');

    // For now, set inputs and params as empty objects directly in the isolate
    // This simplifies debugging - we'll add proper data transfer once basic execution works
    await context.eval(`
      globalThis.__inputs__ = {};
      globalThis.__params__ = {};
    `);

    // Create all utilities within the isolate using eval
    await context.eval(`
      // Console implementation
      globalThis.console = {
        log: function(...args) {
          globalThis.__logs__.push({
            level: 'info',
            message: args.map(String).join(' ')
          });
        },
        warn: function(...args) {
          globalThis.__logs__.push({
            level: 'warn',
            message: args.map(String).join(' ')
          });
        },
        error: function(...args) {
          globalThis.__logs__.push({
            level: 'error',
            message: args.map(String).join(' ')
          });
        }
      };

      // Script context utilities
      globalThis.ctx = {
        script: {
          getInput: function(name) {
            if (typeof name !== 'string' || name.length > 100) {
              throw new Error('Invalid input name');
            }
            return globalThis.__inputs__[name];
          },

          setOutput: function(name, value) {
            if (typeof name !== 'string' || name.length > 100) {
              throw new Error('Invalid output name');
            }
            globalThis.__outputs__[name] = value;
          },

          getParameter: function(name, defaultValue) {
            if (typeof name !== 'string' || name.length > 100) {
              throw new Error('Invalid parameter name');
            }
            const value = globalThis.__params__[name];
            return value !== undefined ? value : defaultValue;
          },

          log: function(message, level = 'info') {
            globalThis.__logs__.push({
              level: level,
              message: String(message).substring(0, 1000)
            });
          },

          createVector: function(x, y, z) {
            if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
              throw new Error('Invalid vector coordinates');
            }
            return { x, y, z };
          }
        }
      };

      // Performance utilities
      globalThis.performance = {
        now: function() {
          return Date.now();
        }
      };

      // Vector3 constructor
      globalThis.Vector3 = function(x, y, z) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
          throw new Error('Invalid vector coordinates');
        }
        return { x, y, z };
      };
    `);
  }

  /**
   * Wrap user script in async function for proper execution
   */
  private wrapScript(script: string): string {
    return `
      (async function() {
        'use strict';
        ${script}
      })();
    `;
  }

  /**
   * Execute compiled script with timeout enforcement
   */
  private async executeWithLimits(
    compiledScript: ivm.Script,
    context: ivm.Context,
    timeoutMS: number
  ): Promise<any> {
    const timeout = timeoutMS || IsolatedVMExecutor.DEFAULT_TIMEOUT_MS;

    try {
      // Run script with timeout (isolate provides true CPU limit)
      const result = await compiledScript.run(context, {
        timeout,
        promise: true, // Wait for async functions to complete
      });

      // If result is a Reference, release it to avoid memory leaks
      // Return undefined since we use __outputs__ for actual data transfer
      if (result && typeof (result as any).release === 'function') {
        (result as any).release();
      }

      return undefined;
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        throw new ScriptExecutionError(
          `Script execution timed out after ${timeout}ms`,
          '' as any // NodeId will be set by caller
        );
      }

      // If the error is about non-transferable values, it's because the script
      // returned a complex object. We ignore this since outputs use __outputs__
      if (error.message?.includes('non-transferable')) {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * Extract outputs from isolate context
   */
  private async extractOutputs(context: ivm.Context): Promise<Record<string, any>> {
    try {
      // Get the __outputs__ object from the isolate context
      const outputsRef = await context.global.get('__outputs__');
      if (!outputsRef) {
        return {};
      }

      // Copy the outputs object from the isolate to the main thread
      const outputsCopy = await outputsRef.copy();
      return outputsCopy || {};
    } catch (error) {
      // If extraction fails, return empty object (outputs may not have been set)
      return {};
    }
  }

  /**
   * Extract logs from isolate context
   */
  private async extractLogs(
    context: ivm.Context,
    logs: ScriptLogEntry[],
    nodeId: string
  ): Promise<void> {
    try {
      // Get the __logs__ array from the isolate context
      const logsRef = await context.global.get('__logs__');
      if (!logsRef) {
        return;
      }

      // Copy the logs array from the isolate to the main thread
      const logsCopy = await logsRef.copy();
      if (Array.isArray(logsCopy)) {
        for (const log of logsCopy) {
          this.addLog(logs, log.level || 'info', log.message || '', nodeId);
        }
      }
    } catch (error) {
      // If extraction fails, silently ignore (logs are nice-to-have)
    }
  }

  /**
   * SECURITY: Comprehensive security checks
   */
  private performSecurityChecks(script: string): { passed: boolean; reason?: string } {
    // 1. Size check
    if (script.length > IsolatedVMExecutor.MAX_SCRIPT_SIZE) {
      return { passed: false, reason: 'Script exceeds maximum size' };
    }

    // 2. Dangerous pattern check
    const dangerousPatterns = [
      { pattern: /\beval\s*\(/, name: 'eval()' },
      { pattern: /=\s*eval\b/, name: 'indirect eval' }, // Catches: const e = eval
      { pattern: /\bFunction\s*\(/, name: 'Function() constructor' },
      { pattern: /new\s+Function/, name: 'new Function()' },
      { pattern: /\b__proto__\b/, name: '__proto__ access' },
      { pattern: /\bprototype\b\s*=/, name: 'prototype mutation' },
      { pattern: /\bconstructor\b\s*\(/, name: 'constructor access' },
      { pattern: /\$\{.*eval.*\}/, name: 'template literal with eval' },
      { pattern: /\$\{.*Function.*\}/, name: 'template literal with Function' },
    ];

    for (const { pattern, name } of dangerousPatterns) {
      if (pattern.test(script)) {
        return { passed: false, reason: `Potentially unsafe pattern: ${name}` };
      }
    }

    return { passed: true };
  }

  /**
   * Analyze script for security concerns
   */
  private analyzeSecurityConcerns(script: string): ScriptError[] {
    const warnings: ScriptError[] = [];
    const lines = script.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('eval(') || line.includes('Function(')) {
        warnings.push({
          line: index + 1,
          column: 1,
          message: 'Use of eval() or Function() constructor is forbidden',
          severity: 'error',
          code: 'SECURITY_EVAL_FORBIDDEN',
        });
      }

      if (line.includes('__proto__') || line.includes('constructor.prototype')) {
        warnings.push({
          line: index + 1,
          column: 1,
          message: 'Prototype manipulation is forbidden',
          severity: 'error',
          code: 'SECURITY_PROTOTYPE_POLLUTION',
        });
      }
    });

    return warnings;
  }

  /**
   * Analyze script for best practices
   */
  private analyzeBestPractices(script: string): ScriptError[] {
    const warnings: ScriptError[] = [];
    const lines = script.split('\n');

    lines.forEach((line, index) => {
      if (line.trim().startsWith('var ')) {
        warnings.push({
          line: index + 1,
          column: line.indexOf('var'),
          message: 'Use "const" or "let" instead of "var"',
          severity: 'info',
          code: 'BEST_PRACTICE_VAR',
        });
      }
    });

    return warnings;
  }

  /**
   * Parse syntax error from isolate compilation
   */
  private parseSyntaxError(error: any): ScriptError | null {
    if (!error) return null;

    const message = String(error.message || error);
    const lineMatch = message.match(/line (\d+)/i);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;

    return {
      line,
      column: 1,
      message: message,
      severity: 'error',
      code: 'SYNTAX_ERROR',
    };
  }

  /**
   * Normalize errors for consistent error handling
   */
  private normalizeError(error: any, nodeId: string): Error {
    if (error instanceof Error) {
      return error;
    }

    const message = String(error.message || error);
    return new Error(message);
  }

  /**
   * Add log entry (SECURITY: sanitized)
   */
  private addLog(
    logs: ScriptLogEntry[],
    level: 'info' | 'warn' | 'error',
    message: string,
    nodeId: string
  ): void {
    // SECURITY: Limit message length and sanitize
    const sanitized = String(message).substring(0, 1000);

    logs.push({
      timestamp: Date.now(),
      level,
      message: sanitized,
      nodeId: nodeId as any,
      executionId: 'current',
    });
  }

  /**
   * Cleanup: Dispose all pooled isolates
   */
  dispose(): void {
    this.isolatePool.forEach((isolate) => isolate.dispose());
    this.isolatePool = [];
  }
}
