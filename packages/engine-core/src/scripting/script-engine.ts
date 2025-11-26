/**
 * Script Engine for Sim4D Custom Nodes
 * Provides secure JavaScript execution environment
 */

import {
  ScriptEngine,
  ScriptExecutor,
  ScriptLanguage,
  ScriptContext,
  ScriptPermissions,
  ScriptTemplate,
  CompiledScript,
  ScriptedNodeDefinition,
  ScriptMetadata,
  ScriptValidationError,
  ScriptExecutionError,
  ScriptSandbox,
  ScriptExecutionResult,
  ScriptValidationResult,
  ScriptMetric,
  NodeId,
} from './types';

import { JavaScriptExecutor } from './javascript-executor';

export class Sim4DScriptEngine implements ScriptEngine {
  private executors = new Map<ScriptLanguage, ScriptExecutor>();
  private templates: ScriptTemplate[] = [];
  private sandboxes = new Map<string, ScriptSandbox>();
  private executionMetrics = new Map<NodeId, ScriptMetric[]>();

  constructor() {
    this.initializeDefaultExecutors();
    this.initializeDefaultTemplates();
  }

  // Language Management
  registerLanguage(language: ScriptLanguage, executor: ScriptExecutor): void {
    this.executors.set(language, executor);
  }

  getSupportedLanguages(): ScriptLanguage[] {
    return Array.from(this.executors.keys());
  }

  // Sandbox Management
  async createSandbox(permissions: ScriptPermissions): Promise<ScriptSandbox> {
    const sandboxId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sandbox = new ScriptSandboxImpl(
      sandboxId,
      permissions,
      this.executors,
      this.executionMetrics
    );

    this.sandboxes.set(sandboxId, sandbox);
    return sandbox;
  }

  async destroySandbox(sandbox: ScriptSandbox): Promise<void> {
    if (sandbox instanceof ScriptSandboxImpl) {
      await sandbox.dispose();
      this.sandboxes.delete(sandbox.getId());
    }
  }

  // Node Generation and Management
  async compileNodeFromScript(
    script: string,
    metadata: ScriptMetadata,
    permissions: ScriptPermissions
  ): Promise<ScriptedNodeDefinition> {
    const language: ScriptLanguage = 'javascript'; // Default to JavaScript for now
    const executor = this.executors.get(language);

    if (!executor) {
      throw new ScriptValidationError(`No executor found for language: ${language}`, []);
    }

    // Validate script
    const validationResult = await executor.validate(script);
    if (!validationResult.valid) {
      throw new ScriptValidationError('Script validation failed', validationResult.errors);
    }

    // Compile script if executor supports it
    let compiled: CompiledScript | undefined;
    if (executor.compile) {
      compiled = await executor.compile(script);
    }

    // Extract node definition from script
    const nodeDefFromScript = await this.extractNodeDefinitionFromScript(script);

    // Validate extracted node definition if it exists
    if (nodeDefFromScript && typeof nodeDefFromScript === 'object') {
      // Check for required fields
      if (
        !nodeDefFromScript.inputs &&
        !nodeDefFromScript.outputs &&
        !nodeDefFromScript.params &&
        !nodeDefFromScript.evaluate
      ) {
        throw new ScriptValidationError(
          'Script validation failed: Node definition must include at least one of: inputs, outputs, params, or evaluate function',
          ['Missing required node definition fields']
        );
      }
    }

    // Generate node definition
    const nodeDefinition: ScriptedNodeDefinition = {
      id: `Script::${metadata.name}`,
      type: `Script::${metadata.name}`,
      category: metadata.category,
      label: metadata.name,
      description: metadata.description,

      // Script-specific properties
      script,
      scriptLanguage: language,
      metadata,
      permissions,
      compiledAt: new Date(),
      compiledBy: 'system', // In real implementation, use current user
      hash: await this.hashScript(script),

      config: {
        cacheable: true,
        parallelizable: false, // Scripts are generally not parallelizable
        deterministicOutput: true,
        maxExecutionTime: permissions.timeoutMS,
        memoryLimit: permissions.memoryLimitMB * 1024 * 1024,
      },

      // Use the actual node definition from script if available, otherwise infer
      inputs: nodeDefFromScript?.inputs || this.inferInputsFromScript(script),
      outputs: nodeDefFromScript?.outputs || this.inferOutputsFromScript(script),
      params: nodeDefFromScript?.params || this.inferParamsFromScript(script),

      // Enhanced evaluate function
      evaluate: async (ctx: ScriptContext, inputs: any, params: unknown) => {
        // If the script defined its own evaluate function, use it
        if (nodeDefFromScript?.evaluate && typeof nodeDefFromScript.evaluate === 'function') {
          try {
            // Apply timeout to the function execution
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Script execution timeout after ${permissions.timeoutMS}ms`));
              }, permissions.timeoutMS);
            });

            const executionPromise = Promise.resolve(
              nodeDefFromScript.evaluate(ctx, inputs, params)
            );

            const result = await Promise.race([executionPromise, timeoutPromise]);
            return result;
          } catch (error) {
            throw new ScriptExecutionError(
              error instanceof Error ? error.message : 'Script execution failed',
              ctx.runtime.nodeId,
              undefined,
              undefined,
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }

        // Fallback to sandbox execution
        const executionContext: ScriptContext = {
          ...ctx,
          inputs,
          params,
        };

        const sandbox = await this.createSandbox(permissions);
        try {
          const result = await sandbox.execute(script, executionContext, permissions);

          if (!result.success) {
            throw new ScriptExecutionError(
              result.error?.message || 'Script execution failed',
              ctx.runtime.nodeId,
              undefined,
              undefined,
              result.error
            );
          }

          // Record metrics
          this.recordExecutionMetrics(ctx.runtime.nodeId, result);

          return result.outputs;
        } finally {
          await this.destroySandbox(sandbox);
        }
      },
    };

    return nodeDefinition;
  }

  async updateNodeScript(nodeId: NodeId, script: string): Promise<ScriptedNodeDefinition> {
    // This would update an existing scripted node
    // For now, recompile from scratch
    const metadata: ScriptMetadata = {
      name: 'Updated Node',
      description: 'Updated script node',
      category: 'Script',
      version: '1.0.0',
      author: 'System',
      tags: [],
    };

    const permissions: ScriptPermissions = {
      allowNetworkAccess: false,
      allowFileSystem: false,
      allowGeometryAPI: true,
      allowWorkerThreads: false,
      timeoutMS: 5000,
      memoryLimitMB: 10,
      allowedImports: [],
    };

    return this.compileNodeFromScript(script, metadata, permissions);
  }

  // Template Management
  registerTemplate(template: ScriptTemplate): void {
    this.templates.push(template);
  }

  getTemplates(category?: string): ScriptTemplate[] {
    if (category) {
      return this.templates.filter((t) => t.category === category);
    }
    return [...this.templates];
  }

  generateFromTemplate(templateName: string, placeholders: Record<string, string>): string {
    const template = this.templates.find((t) => t.name === templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    let script = template.template;
    Object.entries(placeholders).forEach(([key, value]) => {
      // eslint-disable-next-line security/detect-non-literal-regexp -- Template keys are controlled, not user input
      script = script.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    return script;
  }

  // Security and validation
  async validatePermissions(
    _permissions: ScriptPermissions,
    script: string
  ): Promise<ScriptValidationResult> {
    // Basic permission validation
    const executor = this.executors.get('javascript');
    if (!executor) {
      return {
        valid: false,
        errors: [
          { line: 1, column: 1, message: 'No JavaScript executor available', severity: 'error' },
        ],
        warnings: [],
      };
    }

    return executor.validate(script);
  }

  // Performance monitoring
  getExecutionMetrics(nodeId: NodeId): ScriptMetric[] {
    return this.executionMetrics.get(nodeId) || [];
  }

  clearExecutionMetrics(nodeId?: NodeId): void {
    if (nodeId) {
      this.executionMetrics.delete(nodeId);
    } else {
      this.executionMetrics.clear();
    }
  }

  // Utility Methods
  private async hashScript(script: string): Promise<string> {
    // Simple hash implementation for now
    let hash = 0;
    for (let i = 0; i < script.length; i++) {
      const char = script.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * SECURITY: REMOVED unsafe Function() usage
   * Node definition extraction is now handled securely by isolated-vm executor
   */
  private async extractNodeDefinitionFromScript(script: string): Promise<unknown> {
    console.warn(
      'extractNodeDefinitionFromScript: Node definition extraction moved to isolated-vm for security'
    );

    // Return null - node definitions should be extracted during secure execution
    // in the isolated-vm context, not via Function() constructor
    return null;
  }

  private initializeDefaultExecutors(): void {
    this.registerLanguage('javascript', new JavaScriptExecutor());
  }

  private initializeDefaultTemplates(): void {
    // Basic math template
    this.registerTemplate({
      name: 'Math Operation',
      description: 'Template for basic math operations',
      category: 'Math',
      language: 'javascript',
      template: `
function evaluate(ctx, inputs, params) {
  const a = inputs.a || 0;
  const b = inputs.b || 0;
  const operation = params.operation || 'add';

  let result;
  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      result = b !== 0 ? a / b : 0;
      break;
    default:
      result = 0;
  }

  return { result };
}

return {
  type: "Math::{{nodeName}}",
  name: "{{nodeName}}",
  description: "{{description}}",
  inputs: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" }
  },
  outputs: {
    result: { type: "number", description: "Result of operation" }
  },
  params: {
    operation: {
      type: "string",
      default: "add",
      options: ["add", "subtract", "multiply", "divide"],
      description: "Mathematical operation to perform"
    }
  },
  evaluate
};
      `.trim(),
      placeholders: {
        nodeName: 'Custom Math',
        description: 'Performs basic mathematical operations',
      },
      requiredPermissions: {
        allowGeometryAPI: false,
        timeoutMS: 5000,
        memoryLimitMB: 10,
      },
    });
  }

  private inferInputsFromScript(_script: string): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    // Look for getInput calls to infer inputs
    const inputMatches = script.matchAll(/getInput\(['"`]([^'"`]+)['"`]\)/g);
    for (const match of inputMatches) {
      inputs[match[1]] = { type: 'any' };
    }

    // Also look for inputs.propertyName usage
    const propertyMatches = script.matchAll(/inputs\.([a-zA-Z_][a-zA-Z0-9_]*)/g);
    for (const match of propertyMatches) {
      inputs[match[1]] = { type: 'any' };
    }

    return inputs;
  }

  private inferOutputsFromScript(_script: string): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    // Look for setOutput calls and return statements
    const outputMatches = script.matchAll(/setOutput\(['"`]([^'"`]+)['"`]/g);
    for (const match of outputMatches) {
      outputs[match[1]] = { type: 'any' };
    }

    // Also look for return object properties
    const returnMatches = script.matchAll(/return\s*\{\s*([^}]+)\}/g);
    for (const match of returnMatches) {
      const properties = match[1].split(',');
      properties.forEach((prop) => {
        const name = prop.split(':')[0].trim();
        outputs[name] = { type: 'any' };
      });
    }

    return outputs;
  }

  private inferParamsFromScript(script: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Look for getParameter calls to infer parameters
    // Use two separate patterns to avoid optional groups (ReDoS risk)
    const withDefault = script.matchAll(
      /getParameter\(['"`]([\w-]{1,50})['"`],\s*([\w.'"]{1,50})\)/gu
    );
    const withoutDefault = script.matchAll(/getParameter\(['"`]([\w-]{1,50})['"`]\)/gu);

    const paramMatches = [...withDefault, ...withoutDefault];
    for (const match of paramMatches) {
      const paramName = match[1];
      const defaultValue = match[2];

      // Infer type from default value
      let type = 'string';
      if (defaultValue) {
        if (!isNaN(Number(defaultValue))) {
          type = 'number';
        } else if (defaultValue === 'true' || defaultValue === 'false') {
          type = 'boolean';
        }
      }

      params[paramName] = {
        type,
        label: paramName.charAt(0).toUpperCase() + paramName.slice(1),
        default: defaultValue ? JSON.parse(defaultValue) : undefined,
      };
    }

    // Also look for params.propertyName usage
    const propertyMatches = script.matchAll(/params\.([a-zA-Z_][a-zA-Z0-9_]*)/g);
    for (const match of propertyMatches) {
      const paramName = match[1];
      if (!params[paramName]) {
        params[paramName] = {
          type: 'any',
          label: paramName.charAt(0).toUpperCase() + paramName.slice(1),
        };
      }
    }

    return params;
  }

  private recordExecutionMetrics(nodeId: NodeId, result: ScriptExecutionResult): void {
    const metrics = this.executionMetrics.get(nodeId) || [];

    // Add execution time metric
    metrics.push({
      name: 'execution_time',
      value: result.executionTime,
      unit: 'ms',
      timestamp: Date.now(),
      nodeId,
    });

    // Add memory usage metric
    metrics.push({
      name: 'memory_usage',
      value: result.memoryUsage,
      unit: 'bytes',
      timestamp: Date.now(),
      nodeId,
    });

    // Keep only recent metrics (last 100)
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    this.executionMetrics.set(nodeId, metrics);
  }
}

// Sandbox Implementation
class ScriptSandboxImpl implements ScriptSandbox {
  constructor(
    private id: string,
    private permissions: ScriptPermissions,
    private executors: Map<ScriptLanguage, ScriptExecutor>,
    private metricsStore: Map<NodeId, ScriptMetric[]>
  ) {}

  getId(): string {
    return this.id;
  }

  async execute(
    script: string,
    context: ScriptContext,
    permissions: ScriptPermissions
  ): Promise<ScriptExecutionResult> {
    const executor = this.executors.get('javascript'); // Default to JavaScript
    if (!executor) {
      throw new Error('No JavaScript executor available');
    }

    return executor.execute(script, context, permissions);
  }

  async validate(script: string): Promise<ScriptValidationResult> {
    const executor = this.executors.get('javascript');
    if (!executor) {
      throw new Error('No JavaScript executor available');
    }

    return executor.validate(script);
  }

  async dispose(): Promise<void> {
    // Cleanup sandbox resources
  }

  async updateScript(script: string): Promise<void> {
    // Update script in sandbox (for hot reload)
  }

  setBreakpoint(line: number): void {
    // Set debugging breakpoint
  }

  removeBreakpoint(line: number): void {
    // Remove debugging breakpoint
  }

  async step(): Promise<void> {
    // Debug step execution
  }

  async continue(): Promise<void> {
    // Debug continue execution
  }
}
