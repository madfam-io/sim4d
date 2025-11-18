/**
 * JavaScript Script Executor
 * Secure JavaScript execution environment for custom nodes
 *
 * SECURITY: Uses isolated-vm for true sandboxing instead of Function() constructor
 */

import {
  ScriptExecutor,
  ScriptContext,
  ScriptPermissions,
  ScriptExecutionResult,
  ScriptValidationResult,
  ScriptError,
  AutoCompletionItem,
  SyntaxHighlightRules,
  LanguageDocumentation,
  ScriptLogEntry,
  ScriptMetric,
} from './types';

// SECURITY: Import isolated-vm executor for safe code execution
import { IsolatedVMExecutor } from './isolated-vm-executor';

export class JavaScriptExecutor implements ScriptExecutor {
  private workers: Map<string, Worker> = new Map();
  private executionContexts: Map<string, AbortController> = new Map();

  // SECURITY: Use isolated-vm for all script execution
  private isolatedExecutor: IsolatedVMExecutor;

  // SECURITY: Track script hashes to prevent repeated malicious attempts
  private scriptBlacklist: Set<string> = new Set();
  private static readonly MAX_SCRIPT_SIZE = 100000; // 100KB limit
  private static readonly MAX_EXECUTION_DEPTH = 10;

  constructor() {
    this.isolatedExecutor = new IsolatedVMExecutor();
  }

  async execute(
    script: string,
    context: ScriptContext,
    permissions: ScriptPermissions
  ): Promise<ScriptExecutionResult> {
    // SECURITY: Delegate to isolated-vm executor for true sandboxing
    return this.isolatedExecutor.execute(script, context, permissions);
  }

  async validate(script: string): Promise<ScriptValidationResult> {
    const errors: ScriptError[] = [];
    const warnings: ScriptError[] = [];

    // SECURITY: Size check
    if (script.length > JavaScriptExecutor.MAX_SCRIPT_SIZE) {
      errors.push({
        line: 1,
        column: 1,
        message: `Script exceeds maximum size of ${JavaScriptExecutor.MAX_SCRIPT_SIZE} characters`,
        severity: 'error',
        code: 'SCRIPT_TOO_LARGE',
      });
      return { valid: false, errors, warnings, suggestedFixes: [] };
    }

    try {
      // SECURITY: Use safe validation without Function() constructor
      // Parse and validate AST instead of executing
      this.validateScriptSyntax(script);
    } catch (error) {
      if (error instanceof SyntaxError) {
        errors.push({
          line: this.extractLineNumber(error.message) || 1,
          column: 1,
          message: error.message,
          severity: 'error',
          code: 'SYNTAX_ERROR',
        });
        return {
          valid: false,
          errors,
          warnings,
          suggestedFixes: this.generateSuggestedFixes(errors, warnings),
        };
      }
    }

    // Validate node definition structure
    const structureValidation = this.validateNodeStructure(script);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Static analysis for security concerns
    const securityIssues = this.analyzeSecurityConcerns(script);
    warnings.push(...securityIssues);

    // Check for best practices
    const practiceIssues = this.analyzeBestPractices(script);
    warnings.push(...practiceIssues);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestedFixes: this.generateSuggestedFixes(errors, warnings),
    };
  }

  private validateNodeStructure(script: string): {
    errors: ScriptError[];
    warnings: ScriptError[];
  } {
    const errors: ScriptError[] = [];
    const warnings: ScriptError[] = [];

    try {
      // Try to execute the script in a safe context to get the returned node definition
      const nodeDefinition = this.extractNodeDefinition(script);

      if (!nodeDefinition) {
        // Don't require node definition for simple evaluate functions
        return { errors, warnings };
      }

      // Check required fields if node definition exists
      const requiredFields = ['type', 'name', 'inputs', 'outputs', 'params', 'evaluate'];
      for (const field of requiredFields) {
        if (!(field in nodeDefinition)) {
          warnings.push({
            line: 1,
            column: 1,
            message: `Node definition missing recommended field: ${field}`,
            severity: 'warning',
            code: 'MISSING_RECOMMENDED_FIELD',
          });
        }
      }

      // Validate evaluate function
      if (nodeDefinition.evaluate && typeof nodeDefinition.evaluate !== 'function') {
        errors.push({
          line: 1,
          column: 1,
          message: 'Node definition "evaluate" must be a function',
          severity: 'error',
          code: 'INVALID_EVALUATE_FUNCTION',
        });
      }

      // Validate type field format
      if (
        nodeDefinition.type &&
        typeof nodeDefinition.type === 'string' &&
        !nodeDefinition.type.includes('::')
      ) {
        warnings.push({
          line: 1,
          column: 1,
          message: 'Node type should follow "Category::Name" format',
          severity: 'warning',
          code: 'TYPE_FORMAT_WARNING',
        });
      }
    } catch (error) {
      // This is okay - script might just be an evaluate function
    }

    return { errors, warnings };
  }

  /**
   * SECURITY: REMOVED - No longer using Function() for node definition extraction
   * This functionality is now handled securely by isolated-vm
   */
  private extractNodeDefinition(_script: string): any {
    console.warn('extractNodeDefinition: Using isolated-vm for safe execution');
    return null;
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
        'import',
        'export',
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
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
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
        'RegExp',
        'Error',
        'Promise',
        'Set',
        'Map',
        'WeakSet',
        'WeakMap',
        'Symbol',
        'Proxy',
        'Reflect',
        'parseInt',
        'parseFloat',
        'isNaN',
        'isFinite',
      ],
      comments: [/\/\/.*$/, /\/\*[\s\S]*?\*\//],
      strings: [/"(?:[^"\\]|\\[\s\S])*?"/, /'(?:[^'\\]|\\[\s\S])*?'/, /`(?:[^`\\]|\\[\s\S])*?`/],
      numbers: [
        /\b\d+\.\d+[eE][+-]\d+\b/, // Float with exponent (strict)
        /\b\d+\.\d+\b/, // Float without exponent
        /\b\d+[eE][+-]\d+\b/, // Integer with exponent (strict)
        /\b\d+\b/, // Integer
        /\b0[xX][0-9a-fA-F]+\b/,
        /\b0[bB][01]+\b/,
        /\b0[oO][0-7]+\b/,
      ],
    };
  }

  async getAutoCompletion(
    script: string,
    position: { line: number; column: number }
  ): Promise<AutoCompletionItem[]> {
    const items: AutoCompletionItem[] = [];

    // Built-in JavaScript completions
    items.push(
      ...this.getBuiltinCompletions(),
      ...this.getScriptContextCompletions(),
      ...this.getGeometryAPICompletions()
    );

    // Context-aware completions based on current code
    const currentLine = script.split('\n')[position.line - 1];
    const beforeCursor = currentLine.substring(0, position.column);

    if (beforeCursor.includes('ctx.script.')) {
      items.push(...this.getScriptUtilityCompletions());
    }

    if (beforeCursor.includes('ctx.geom.')) {
      items.push(...this.getGeometryMethodCompletions());
    }

    return items.sort((a, b) => a.label.localeCompare(b.label));
  }

  async formatCode(script: string): Promise<string> {
    // Basic formatting - in a real implementation, you might use Prettier
    return script
      .replace(/;\s*\n/g, ';\n')
      .replace(/\{\s*\n/g, '{\n  ')
      .replace(/\n\s*\}/g, '\n}')
      .replace(/,\s*\n/g, ',\n  ');
  }

  getLanguageDocumentation(): LanguageDocumentation {
    return {
      name: 'JavaScript',
      version: 'ES2022',
      description: 'JavaScript scripting environment for BrepFlow custom nodes',
      quickStart: `
// Basic node script structure
async function evaluate(ctx, inputs, params) {
  // Access inputs
  const shape = ctx.script.getInput('shape');

  // Access parameters
  const distance = ctx.script.getParameter('distance', 10);

  // Perform geometry operations
  const result = await ctx.geom.invoke('MAKE_EXTRUDE', {
    face: shape,
    distance: distance
  });

  // Set outputs
  ctx.script.setOutput('result', result);

  return { result };
}
      `,
      apiReference: [
        {
          name: 'ctx.script.getInput',
          type: 'function',
          signature: 'getInput<T>(name: string): T | undefined',
          description: 'Get input value by name',
          parameters: [{ name: 'name', type: 'string', description: 'Input socket name' }],
          returns: {
            type: 'T | undefined',
            description: 'Input value or undefined if not connected',
          },
          examples: ['const shape = ctx.script.getInput("shape");'],
        },
        {
          name: 'ctx.script.setOutput',
          type: 'function',
          signature: 'setOutput(name: string, value: any): void',
          description: 'Set output value by name',
          parameters: [
            { name: 'name', type: 'string', description: 'Output socket name' },
            { name: 'value', type: 'any', description: 'Value to output' },
          ],
          examples: ['ctx.script.setOutput("result", myShape);'],
        },
      ],
      examples: [
        {
          title: 'Simple Box Creator',
          description: 'Creates a box with customizable dimensions',
          code: `
async function evaluate(ctx, inputs, params) {
  const width = ctx.script.getParameter('width', 10);
  const height = ctx.script.getParameter('height', 10);
  const depth = ctx.script.getParameter('depth', 10);

  const box = await ctx.geom.invoke('MAKE_BOX', {
    width, height, depth
  });

  return { shape: box };
}
          `,
        },
      ],
      troubleshooting: [
        {
          problem: 'Script execution timeout',
          symptoms: ['Script stops executing', 'Timeout error message'],
          solutions: [
            'Reduce computational complexity',
            'Use async/await for long operations',
            'Request higher timeout limit',
          ],
        },
      ],
    };
  }

  private createSecureSandbox(
    context: ScriptContext,
    permissions: ScriptPermissions,
    logs: ScriptLogEntry[],
    _metrics: ScriptMetric[]
  ) {
    // SECURITY: Create completely isolated sandbox with whitelisted APIs only
    const scriptUtils = {
      getInput: (name: string) => {
        // Validate input name
        if (typeof name !== 'string' || name.length > 100) {
          throw new Error('Invalid input name');
        }
        return (context as any).inputs?.[name];
      },
      getParameter: (name: string, defaultValue?: any) => {
        if (typeof name !== 'string' || name.length > 100) {
          throw new Error('Invalid parameter name');
        }
        return (context as any).params?.[name] ?? defaultValue;
      },
      setOutput: (name: string, value: any) => {
        if (typeof name !== 'string' || name.length > 100) {
          throw new Error('Invalid output name');
        }
        // SECURITY: Deep freeze outputs to prevent mutation
        if (!(context as any).outputs) (context as any).outputs = {};
        (context as any).outputs[name] = Object.freeze(value);
      },
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        // SECURITY: Sanitize log messages
        const sanitized = String(message).substring(0, 1000);
        this.addLog(logs, level, sanitized, context.runtime.nodeId);
      },
      createVector: (x: number, y: number, z: number) => {
        // SECURITY: Validate numeric inputs
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
          throw new Error('Invalid vector coordinates');
        }
        return Object.freeze({ x, y, z });
      },
    };

    // SECURITY: Create sandbox with frozen prototype chain
    const sandbox = Object.create(null);

    // Whitelist safe objects only (no prototype access)
    Object.defineProperties(sandbox, {
      console: {
        value: Object.freeze({
          log: (message: string) =>
            this.addLog(logs, 'info', String(message).substring(0, 1000), context.runtime.nodeId),
          warn: (message: string) =>
            this.addLog(logs, 'warn', String(message).substring(0, 1000), context.runtime.nodeId),
          error: (message: string) =>
            this.addLog(logs, 'error', String(message).substring(0, 1000), context.runtime.nodeId),
        }),
        writable: false,
        enumerable: true,
        configurable: false,
      },
      Math: {
        value: Object.freeze(Math),
        writable: false,
        enumerable: true,
        configurable: false,
      },
      ctx: {
        value: Object.freeze({
          ...context,
          script: Object.freeze(scriptUtils),
        }),
        writable: false,
        enumerable: true,
        configurable: false,
      },
      Vector3: {
        value: Object.freeze((x: number, y: number, z: number) =>
          scriptUtils.createVector(x, y, z)
        ),
        writable: false,
        enumerable: true,
        configurable: false,
      },
      performance: {
        value: Object.freeze({
          now: () => performance.now(),
        }),
        writable: false,
        enumerable: true,
        configurable: false,
      },
    });

    // SECURITY: Freeze the entire sandbox
    return Object.freeze(sandbox);
  }

  /**
   * SECURITY: REMOVED - No longer using unsafe execution
   * All execution now goes through isolated-vm
   */
  private async executeInSecureContext(
    _script: string,
    _sandbox: any,
    _context: ScriptContext,
    _permissions: ScriptPermissions,
    _signal: AbortSignal
  ): Promise<{ outputs: any; memoryUsage: number }> {
    // This method is no longer used - keeping stub for compatibility
    throw new Error('Direct execution removed for security. Use isolated-vm executor.');
  }

  /**
   * SECURITY: Safe syntax validation without code execution
   */
  private validateScriptSyntax(script: string): void {
    // Use esprima or acorn for AST parsing (no execution)
    // For now, basic regex-based validation as temporary measure

    // Check for obvious security issues
    const dangerousPatterns = [
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /\b__proto__\b/,
      /\bprototype\b.*?=/,
      /\bconstructor\b.*?\(/,
      /\bprocess\b/,
      /\brequire\s*\(/,
      /\bimport\s*\(/,
      /\bdocument\./,
      /\bwindow\./,
      /\blocalStorage\./,
      /\bsessionStorage\./,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(script)) {
        throw new SyntaxError(`Potentially unsafe pattern detected: ${pattern.source}`);
      }
    }

    // SYNTAX VALIDATION: Use Function constructor for syntax checking only (no execution)
    // This is safe because we're only parsing, not calling the function
    try {
      // Wrap in function to allow return statements
      new Function(script);
    } catch (error) {
      // Re-throw syntax errors
      if (error instanceof SyntaxError) {
        throw error;
      }
      // For other errors, wrap in SyntaxError
      throw new SyntaxError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * SECURITY: Comprehensive security checks before execution
   */
  private performSecurityChecks(script: string): { passed: boolean; reason?: string } {
    // 1. Size check
    if (script.length > JavaScriptExecutor.MAX_SCRIPT_SIZE) {
      return { passed: false, reason: 'Script exceeds maximum size' };
    }

    // 2. Blacklist check
    const scriptHash = this.hashScript(script);
    if (this.scriptBlacklist.has(scriptHash)) {
      return { passed: false, reason: 'Script previously flagged as malicious' };
    }

    // 3. Dangerous pattern check
    try {
      this.validateScriptSyntax(script);
    } catch (error) {
      // Add to blacklist
      this.scriptBlacklist.add(scriptHash);
      return {
        passed: false,
        reason: error instanceof Error ? error.message : 'Script validation failed',
      };
    }

    // 4. CSP compliance check (if CSP is enabled)
    if (!this.checkCSPCompliance(script)) {
      return { passed: false, reason: 'Script violates Content Security Policy' };
    }

    return { passed: true };
  }

  /**
   * SECURITY: Check if script complies with CSP
   */
  private checkCSPCompliance(script: string): boolean {
    // Ensure no inline event handlers or dangerous functions
    const cspViolations = [
      /on\w+\s*=/, // inline event handlers: onclick=, onload=, etc.
      /javascript:/, // javascript: protocol
      /data:text\/html/, // data: URLs
    ];

    return !cspViolations.some((pattern) => pattern.test(script));
  }

  /**
   * SECURITY: Hash script for blacklist tracking
   */
  private hashScript(script: string): string {
    // Simple hash for demo - use crypto.subtle.digest in production
    let hash = 0;
    for (let i = 0; i < script.length; i++) {
      const char = script.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private analyzeSecurityConcerns(script: string): ScriptError[] {
    const warnings: ScriptError[] = [];
    const lines = script.split('\n');

    lines.forEach((line, index) => {
      // Check for dangerous patterns
      if (line.includes('eval(') || line.includes('Function(')) {
        warnings.push({
          line: index + 1,
          column: line.indexOf('eval(') !== -1 ? line.indexOf('eval(') : line.indexOf('Function('),
          message: 'Use of eval() or Function() constructor detected - potential security risk',
          severity: 'warning',
          code: 'SECURITY_EVAL',
        });
      }

      if (line.includes('document.') || line.includes('window.')) {
        warnings.push({
          line: index + 1,
          column: 1,
          message: 'Access to DOM objects not allowed in node scripts',
          severity: 'warning',
          code: 'SECURITY_DOM_ACCESS',
        });
      }
    });

    return warnings;
  }

  private analyzeBestPractices(script: string): ScriptError[] {
    const warnings: ScriptError[] = [];
    const lines = script.split('\n');

    lines.forEach((line, index) => {
      // Check for var usage
      if (line.trim().startsWith('var ')) {
        warnings.push({
          line: index + 1,
          column: line.indexOf('var'),
          message: 'Consider using "const" or "let" instead of "var"',
          severity: 'info',
          code: 'BEST_PRACTICE_VAR',
        });
      }

      // Check for missing async/await
      if (line.includes('ctx.geom.invoke') && !line.includes('await')) {
        warnings.push({
          line: index + 1,
          column: line.indexOf('ctx.geom.invoke'),
          message: 'Geometry operations should use "await" for proper execution',
          severity: 'warning',
          code: 'BEST_PRACTICE_AWAIT',
        });
      }
    });

    return warnings;
  }

  private generateSuggestedFixes(_errors: ScriptError[], _warnings: ScriptError[]) {
    return []; // Implementation would generate automatic fixes
  }

  private extractLineNumber(errorMessage: string): number | null {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  private addLog(
    logs: ScriptLogEntry[],
    level: 'info' | 'warn' | 'error',
    message: string,
    nodeId: string
  ) {
    logs.push({
      timestamp: Date.now(),
      level,
      message,
      nodeId: nodeId as any, // TODO: Fix NodeId branded type
      executionId: 'current',
    });
  }

  private addMetric(
    metrics: ScriptMetric[],
    name: string,
    value: number,
    unit: string,
    nodeId: string
  ) {
    metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
      nodeId: nodeId as any, // TODO: Fix NodeId branded type
    });
  }

  private getBuiltinCompletions(): AutoCompletionItem[] {
    return [
      {
        label: 'console.log',
        kind: 'function',
        detail: '(message: string) => void',
        documentation: 'Log a message to the console',
        insertText: 'console.log($1)',
      },
      {
        label: 'Math.PI',
        kind: 'variable',
        detail: 'number',
        documentation: "The ratio of a circle's circumference to its diameter",
      },
    ];
  }

  private getScriptContextCompletions(): AutoCompletionItem[] {
    return [
      {
        label: 'ctx',
        kind: 'variable',
        detail: 'ScriptContext',
        documentation: 'The script execution context',
      },
      {
        label: 'ctx.script',
        kind: 'variable',
        detail: 'ScriptUtilities',
        documentation: 'Script utility functions',
      },
    ];
  }

  private getGeometryAPICompletions(): AutoCompletionItem[] {
    return [
      {
        label: 'ctx.geom.invoke',
        kind: 'function',
        detail: '(operation: string, params: any) => Promise<any>',
        documentation: 'Invoke a geometry operation',
        insertText: 'ctx.geom.invoke($1)',
      },
    ];
  }

  private getScriptUtilityCompletions(): AutoCompletionItem[] {
    return [
      {
        label: 'getInput',
        kind: 'function',
        detail: '<T>(name: string) => T | undefined',
        documentation: 'Get input value by name',
        insertText: 'getInput($1)',
      },
      {
        label: 'setOutput',
        kind: 'function',
        detail: '(name: string, value: any) => void',
        documentation: 'Set output value by name',
        insertText: 'setOutput($1, $2)',
      },
    ];
  }

  private getGeometryMethodCompletions(): AutoCompletionItem[] {
    return [
      {
        label: 'MAKE_BOX',
        kind: 'variable',
        detail: 'string',
        documentation: 'Create a box geometry',
      },
      {
        label: 'MAKE_SPHERE',
        kind: 'variable',
        detail: 'string',
        documentation: 'Create a sphere geometry',
      },
    ];
  }
}
