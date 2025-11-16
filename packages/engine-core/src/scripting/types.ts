/**
 * Advanced Node Scripting API Types
 * Provides type-safe interfaces for creating custom nodes through scripts
 */

import type { NodeDefinition, EvalContext, NodeId, ShapeHandle, Vec3 } from '@brepflow/types';

export type ScriptLanguage = 'javascript' | 'python' | 'lua';

export interface ScriptPermissions {
  allowFileSystem: boolean;
  allowNetworkAccess: boolean;
  allowGeometryAPI: boolean;
  allowWorkerThreads: boolean;
  memoryLimitMB: number;
  timeoutMS: number;
  allowedImports: string[];
}

export interface ScriptMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  tags: string[];
  icon?: string;
  documentation?: string;
  examples?: ScriptExample[];
}

export interface ScriptExample {
  title: string;
  description: string;
  code: string;
  parameters?: Record<string, any>;
}

export interface ScriptValidationResult {
  valid: boolean;
  errors: ScriptError[];
  warnings: ScriptWarning[];
  suggestedFixes?: ScriptFix[];
}

export interface ScriptError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ScriptWarning extends ScriptError {
  suggestion?: string;
}

export interface ScriptFix {
  description: string;
  startLine: number;
  endLine: number;
  replacement: string;
}

export interface ScriptContext extends EvalContext {
  // Enhanced context for scripted nodes
  script: {
    // Utility functions available to scripts
    log: (message: string, level?: 'info' | 'warn' | 'error') => void;
    progress: (value: number, message?: string) => void;

    // Geometry helpers
    createVector: (x: number, y: number, z: number) => Vec3;
    measureDistance: (p1: Vec3, p2: Vec3) => number;

    // Node utilities
    getParameter: <T = any>(name: string, defaultValue?: T) => T;
    setOutput: (name: string, value: any) => void;
    getInput: <T = any>(name: string) => T | undefined;

    // Async utilities
    sleep: (ms: number) => Promise<void>;
    timeout: <T>(promise: Promise<T>, ms: number) => Promise<T>;

    // Performance monitoring
    startTimer: (label: string) => () => number;
    recordMetric: (name: string, value: number, unit?: string) => void;
  };

  // Runtime information
  runtime: {
    nodeId: NodeId;
    executionId: string;
    startTime: number;
    memoryUsage: () => number;
    isAborted: () => boolean;
  };

  // Collaboration context (if in collaborative session)
  collaboration?: {
    userId: string;
    sessionId: string;
    userCount: number;
    isLocked: boolean;
    lockOwner?: string;
  };
}

export interface ScriptedNodeDefinition extends NodeDefinition {
  // Script source and metadata
  script: string;
  scriptLanguage: ScriptLanguage;
  metadata: ScriptMetadata;
  permissions: ScriptPermissions;

  // Compilation information
  compiledAt: Date;
  compiledBy: string;
  hash: string;

  // Runtime configuration
  config: {
    cacheable: boolean;
    parallelizable: boolean;
    deterministicOutput: boolean;
    maxExecutionTime: number;
    memoryLimit: number;
  };

  // Enhanced evaluation with script execution
  evaluate: (ctx: ScriptContext, inputs: any, params: any) => Promise<any>;

  // Script lifecycle hooks
  onInitialize?: (ctx: ScriptContext) => Promise<void>;
  onDispose?: (ctx: ScriptContext) => Promise<void>;
  onParameterChange?: (
    ctx: ScriptContext,
    paramName: string,
    oldValue: any,
    newValue: any
  ) => Promise<void>;
}

export interface ScriptTemplate {
  name: string;
  description: string;
  language: ScriptLanguage;
  category: string;
  template: string;
  placeholders: Record<string, string>;
  requiredPermissions: Partial<ScriptPermissions>;
}

export interface ScriptExecutionResult {
  success: boolean;
  outputs: Record<string, any>;
  logs: ScriptLogEntry[];
  metrics: ScriptMetric[];
  executionTime: number;
  memoryUsage: number;
  error?: Error;
  warnings?: string[];
}

export interface ScriptLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId: NodeId;
  executionId: string;
}

export interface ScriptMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  nodeId: NodeId;
}

export interface ScriptSandbox {
  execute: (
    script: string,
    context: ScriptContext,
    permissions: ScriptPermissions
  ) => Promise<ScriptExecutionResult>;

  validate: (script: string) => Promise<ScriptValidationResult>;

  dispose: () => Promise<void>;

  // Hot reload support
  updateScript: (script: string) => Promise<void>;

  // Debugging support
  setBreakpoint: (line: number) => void;
  removeBreakpoint: (line: number) => void;
  step: () => Promise<void>;
  continue: () => Promise<void>;
}

export interface ScriptEngine {
  // Language management
  registerLanguage: (language: ScriptLanguage, executor: ScriptExecutor) => void;

  getSupportedLanguages: () => ScriptLanguage[];

  // Sandbox management
  createSandbox: (permissions: ScriptPermissions) => Promise<ScriptSandbox>;

  destroySandbox: (sandbox: ScriptSandbox) => Promise<void>;

  // Node generation
  compileNodeFromScript: (
    script: string,
    metadata: ScriptMetadata,
    permissions: ScriptPermissions
  ) => Promise<ScriptedNodeDefinition>;

  updateNodeScript: (nodeId: NodeId, script: string) => Promise<ScriptedNodeDefinition>;

  // Template management
  getTemplates: (category?: string) => ScriptTemplate[];

  registerTemplate: (template: ScriptTemplate) => void;

  // Security and validation
  validatePermissions: (
    permissions: ScriptPermissions,
    script: string
  ) => Promise<ScriptValidationResult>;

  // Performance monitoring
  getExecutionMetrics: (nodeId: NodeId) => ScriptMetric[];

  clearExecutionMetrics: (nodeId?: NodeId) => void;
}

export interface ScriptExecutor {
  // Core execution
  execute: (
    script: string,
    context: ScriptContext,
    permissions: ScriptPermissions
  ) => Promise<ScriptExecutionResult>;

  // Validation and compilation
  validate: (script: string) => Promise<ScriptValidationResult>;

  compile?: (script: string) => Promise<CompiledScript>;

  // Language-specific features
  getSyntaxHighlighting: () => SyntaxHighlightRules;

  getAutoCompletion: (
    script: string,
    position: { line: number; column: number }
  ) => Promise<AutoCompletionItem[]>;

  formatCode: (script: string) => Promise<string>;

  // Documentation
  getLanguageDocumentation: () => LanguageDocumentation;
}

export interface CompiledScript {
  bytecode?: any;
  sourceMap?: any;
  dependencies: string[];
  entryPoint: string;
}

export interface SyntaxHighlightRules {
  keywords: string[];
  operators: string[];
  builtins: string[];
  comments: RegExp[];
  strings: RegExp[];
  numbers: RegExp[];
}

export interface AutoCompletionItem {
  label: string;
  kind: 'function' | 'variable' | 'keyword' | 'type' | 'module';
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
}

export interface LanguageDocumentation {
  name: string;
  version: string;
  description: string;
  quickStart: string;
  apiReference: ApiReference[];
  examples: ScriptExample[];
  troubleshooting: TroubleshootingGuide[];
}

export interface ApiReference {
  name: string;
  type: 'function' | 'class' | 'interface' | 'constant';
  signature: string;
  description: string;
  parameters?: ParameterDoc[];
  returns?: ReturnDoc;
  examples?: string[];
  seeAlso?: string[];
}

export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  defaultValue?: any;
}

export interface ReturnDoc {
  type: string;
  description: string;
}

export interface TroubleshootingGuide {
  problem: string;
  symptoms: string[];
  solutions: string[];
  prevention?: string[];
}

// Error types for script execution
export class ScriptExecutionError extends Error {
  constructor(
    message: string,
    public readonly nodeId: NodeId,
    public readonly line?: number,
    public readonly column?: number,
    public readonly scriptError?: Error
  ) {
    super(message);
    this.name = 'ScriptExecutionError';
  }
}

export class ScriptValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: ScriptError[]
  ) {
    super(message);
    this.name = 'ScriptValidationError';
  }
}

export class ScriptPermissionError extends Error {
  constructor(
    message: string,
    public readonly requestedPermission: keyof ScriptPermissions,
    public readonly context: string
  ) {
    super(message);
    this.name = 'ScriptPermissionError';
  }
}
