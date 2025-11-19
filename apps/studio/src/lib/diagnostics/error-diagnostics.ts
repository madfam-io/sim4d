/**
 * Enhanced error diagnostics system with suggestions and remediation guidance
 */

import { ErrorCode, ErrorCategory, ErrorSeverity } from '../error-handling/types';

export interface DiagnosticSuggestion {
  id: string;
  title: string;
  description: string;
  actionType: 'fix' | 'workaround' | 'documentation' | 'contact_support';
  confidence: number; // 0-100
  estimatedTime?: string; // e.g., "2 minutes", "immediate"
  steps?: string[];
  relatedLinks?: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'forum' | 'github';
  }>;
}

export interface NodeErrorDiagnostic {
  nodeId: string;
  nodeType: string;
  errorCode: ErrorCode;
  errorMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  suggestions: DiagnosticSuggestion[];
  context: {
    parameters?: Record<string, unknown>;
    inputValues?: Record<string, unknown>;
    systemState?: Record<string, unknown>;
    relatedErrors?: string[]; // Other node IDs with related errors
  };
}

export class ErrorDiagnosticsEngine {
  private static instance: ErrorDiagnosticsEngine | null = null;
  private diagnosticRules: Map<ErrorCode, (context: unknown) => DiagnosticSuggestion[]> = new Map();
  private errorHistory: Map<string, NodeErrorDiagnostic[]> = new Map();
  private readonly MAX_HISTORY_SIZE = 50;

  private constructor() {
    this.initializeDiagnosticRules();
  }

  public static getInstance(): ErrorDiagnosticsEngine {
    if (!ErrorDiagnosticsEngine.instance) {
      ErrorDiagnosticsEngine.instance = new ErrorDiagnosticsEngine();
    }
    return ErrorDiagnosticsEngine.instance;
  }

  /**
   * Analyze an error and provide diagnostic suggestions
   */
  public analyzeError(
    nodeId: string,
    nodeType: string,
    errorCode: ErrorCode,
    errorMessage: string,
    context: unknown = {}
  ): NodeErrorDiagnostic {
    const category = this.categorizeError(errorCode);
    const severity = this.assessSeverity(errorCode, context);
    const suggestions = this.generateSuggestions(errorCode, { ...context, nodeType, errorMessage });

    const diagnostic: NodeErrorDiagnostic = {
      nodeId,
      nodeType,
      errorCode,
      errorMessage,
      category,
      severity,
      timestamp: new Date(),
      suggestions,
      context: {
        parameters: context.parameters,
        inputValues: context.inputValues,
        systemState: context.systemState,
        relatedErrors: this.findRelatedErrors(nodeId, errorCode),
      },
    };

    // Store in history
    this.addToHistory(nodeId, diagnostic);

    return diagnostic;
  }

  /**
   * Get error history for a node
   */
  public getErrorHistory(nodeId: string): NodeErrorDiagnostic[] {
    return this.errorHistory.get(nodeId) || [];
  }

  /**
   * Get error patterns and trends
   */
  public getErrorPatterns(nodeId?: string): {
    mostCommonErrors: Array<{ code: ErrorCode; count: number; lastSeen: Date }>;
    errorTrends: Array<{ date: string; count: number }>;
    criticalErrors: NodeErrorDiagnostic[];
    recentErrors: NodeErrorDiagnostic[];
  } {
    const allDiagnostics = nodeId
      ? this.errorHistory.get(nodeId) || []
      : Array.from(this.errorHistory.values()).flat();

    // Most common errors
    const errorCounts = new Map<ErrorCode, { count: number; lastSeen: Date }>();
    allDiagnostics.forEach((d) => {
      const existing = errorCounts.get(d.errorCode);
      if (existing) {
        existing.count++;
        if (d.timestamp > existing.lastSeen) {
          existing.lastSeen = d.timestamp;
        }
      } else {
        errorCounts.set(d.errorCode, { count: 1, lastSeen: d.timestamp });
      }
    });

    const mostCommonErrors = Array.from(errorCounts.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error trends (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailyCounts = new Map<string, number>();

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts.set(dateStr, 0);
    }

    allDiagnostics
      .filter((d) => d.timestamp >= sevenDaysAgo)
      .forEach((d) => {
        const dateStr = d.timestamp.toISOString().split('T')[0];
        const count = dailyCounts.get(dateStr) || 0;
        dailyCounts.set(dateStr, count + 1);
      });

    const errorTrends = Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Critical and recent errors
    const criticalErrors = allDiagnostics
      .filter((d) => d.severity === ErrorSeverity.CRITICAL)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const recentErrors = allDiagnostics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    return {
      mostCommonErrors,
      errorTrends,
      criticalErrors,
      recentErrors,
    };
  }

  /**
   * Clear error history for a node
   */
  public clearErrorHistory(nodeId: string): void {
    this.errorHistory.delete(nodeId);
  }

  private initializeDiagnosticRules(): void {
    // Geometry computation errors
    this.diagnosticRules.set(ErrorCode.GEOMETRY_COMPUTATION_FAILED, (context) => [
      {
        id: 'check-parameters',
        title: 'Check Parameter Values',
        description: 'Invalid or extreme parameter values can cause geometry computation to fail.',
        actionType: 'fix',
        confidence: 85,
        estimatedTime: '1 minute',
        steps: [
          'Review all parameter values for validity',
          'Ensure dimensions are positive and reasonable',
          'Check for extreme values that might cause overflow',
          'Verify units are consistent',
        ],
      },
      {
        id: 'check-inputs',
        title: 'Verify Input Connections',
        description: 'Missing or invalid input geometry can prevent successful computation.',
        actionType: 'fix',
        confidence: 75,
        estimatedTime: '2 minutes',
        steps: [
          'Ensure all required inputs are connected',
          'Check that input geometry is valid',
          'Verify input geometry is not degenerate',
        ],
      },
      {
        id: 'simplify-operation',
        title: 'Simplify the Operation',
        description: 'Complex operations might exceed computational limits.',
        actionType: 'workaround',
        confidence: 60,
        estimatedTime: '5 minutes',
        steps: [
          'Break complex operations into simpler steps',
          'Reduce geometric complexity',
          'Use intermediate preview steps',
        ],
      },
    ]);

    // Parameter validation errors
    this.diagnosticRules.set(ErrorCode.INVALID_GEOMETRY_PARAMETERS, (context) => [
      {
        id: 'parameter-ranges',
        title: 'Check Parameter Ranges',
        description: 'Parameter values are outside acceptable ranges.',
        actionType: 'fix',
        confidence: 95,
        estimatedTime: 'immediate',
        steps: [
          'Review parameter minimum and maximum values',
          'Adjust values to be within valid ranges',
          'Consider the physical meaning of parameters',
        ],
      },
    ]);

    // WASM initialization errors
    this.diagnosticRules.set(ErrorCode.GEOMETRY_ENGINE_NOT_INITIALIZED, (context) => [
      {
        id: 'reload-page',
        title: 'Reload the Application',
        description: 'The geometry engine failed to initialize properly.',
        actionType: 'fix',
        confidence: 80,
        estimatedTime: '30 seconds',
        steps: [
          'Refresh the browser page',
          'Wait for complete application load',
          'Check browser console for additional errors',
        ],
      },
      {
        id: 'check-browser',
        title: 'Verify Browser Compatibility',
        description: 'Your browser might not support required WebAssembly features.',
        actionType: 'documentation',
        confidence: 70,
        estimatedTime: '5 minutes',
        steps: [
          'Update your browser to the latest version',
          'Enable WebAssembly in browser settings',
          'Check for SharedArrayBuffer support',
        ],
        relatedLinks: [
          {
            title: 'Browser Compatibility Guide',
            url: '/docs/browser-support',
            type: 'documentation',
          },
        ],
      },
    ]);

    // Circular dependency errors
    this.diagnosticRules.set(ErrorCode.CIRCULAR_DEPENDENCY, (context) => [
      {
        id: 'break-cycle',
        title: 'Break the Dependency Cycle',
        description: 'Nodes are connected in a circular dependency that prevents evaluation.',
        actionType: 'fix',
        confidence: 90,
        estimatedTime: '3 minutes',
        steps: [
          'Identify the circular connection path',
          'Remove one connection to break the cycle',
          'Reorganize nodes to create a clear data flow',
          'Use intermediate nodes if needed',
        ],
      },
    ]);

    // Missing input errors
    this.diagnosticRules.set(ErrorCode.MISSING_REQUIRED_INPUT, (context) => [
      {
        id: 'connect-input',
        title: 'Connect Required Input',
        description: 'This node requires input connections to function properly.',
        actionType: 'fix',
        confidence: 95,
        estimatedTime: '1 minute',
        steps: [
          'Identify which inputs are required',
          'Connect appropriate output from another node',
          'Verify the data types match',
        ],
      },
    ]);

    // Performance-related errors
    this.diagnosticRules.set(ErrorCode.EVALUATION_TIMEOUT, (context) => [
      {
        id: 'optimize-graph',
        title: 'Optimize Node Graph',
        description: 'The computation is taking too long and has timed out.',
        actionType: 'workaround',
        confidence: 70,
        estimatedTime: '10 minutes',
        steps: [
          'Simplify complex geometric operations',
          'Reduce parameter precision where appropriate',
          'Break large operations into smaller chunks',
          'Consider using lower-resolution previews',
        ],
      },
      {
        id: 'increase-timeout',
        title: 'Increase Timeout Limit',
        description: 'The operation might complete with more time.',
        actionType: 'fix',
        confidence: 50,
        estimatedTime: '1 minute',
        steps: [
          'Go to application settings',
          'Increase the evaluation timeout',
          'Retry the operation',
        ],
      },
    ]);

    // Memory errors
    this.diagnosticRules.set(ErrorCode.MEMORY_LIMIT_EXCEEDED, (context) => [
      {
        id: 'reduce-complexity',
        title: 'Reduce Geometric Complexity',
        description: 'The operation requires more memory than available.',
        actionType: 'workaround',
        confidence: 80,
        estimatedTime: '5 minutes',
        steps: [
          'Reduce mesh resolution or detail level',
          'Simplify input geometry',
          'Process in smaller batches',
          'Close other browser tabs to free memory',
        ],
      },
    ]);
  }

  private categorizeError(errorCode: ErrorCode): ErrorCategory {
    const categoryMap: Record<string, ErrorCategory> = {
      GEOMETRY_: ErrorCategory.GEOMETRY,
      WASM_: ErrorCategory.WASM,
      NETWORK_: ErrorCategory.NETWORK,
      INVALID_: ErrorCategory.VALIDATION,
      CIRCULAR_: ErrorCategory.VALIDATION,
      MISSING_: ErrorCategory.VALIDATION,
      EVALUATION_: ErrorCategory.RUNTIME,
      MEMORY_: ErrorCategory.RUNTIME,
      WORKER_: ErrorCategory.RUNTIME,
    };

    for (const [prefix, category] of Object.entries(categoryMap)) {
      if (errorCode.startsWith(prefix)) {
        return category;
      }
    }

    return ErrorCategory.RUNTIME;
  }

  private assessSeverity(errorCode: ErrorCode, context: unknown): ErrorSeverity {
    // Critical errors that prevent core functionality
    const criticalErrors = [
      ErrorCode.GEOMETRY_ENGINE_NOT_INITIALIZED,
      ErrorCode.WASM_MODULE_LOAD_FAILED,
      ErrorCode.MEMORY_LIMIT_EXCEEDED,
      ErrorCode.WORKER_THREAD_CRASHED,
    ];

    // High severity errors that block user workflow
    const highErrors = [
      ErrorCode.GEOMETRY_COMPUTATION_FAILED,
      ErrorCode.CIRCULAR_DEPENDENCY,
      ErrorCode.EVALUATION_TIMEOUT,
    ];

    // Medium severity errors that limit functionality
    const mediumErrors = [
      ErrorCode.INVALID_GEOMETRY_PARAMETERS,
      ErrorCode.MISSING_REQUIRED_INPUT,
      ErrorCode.INVALID_NODE_CONNECTION,
    ];

    if (criticalErrors.includes(errorCode)) {
      return ErrorSeverity.CRITICAL;
    } else if (highErrors.includes(errorCode)) {
      return ErrorSeverity.HIGH;
    } else if (mediumErrors.includes(errorCode)) {
      return ErrorSeverity.MEDIUM;
    } else {
      return ErrorSeverity.LOW;
    }
  }

  private generateSuggestions(errorCode: ErrorCode, context: unknown): DiagnosticSuggestion[] {
    const ruleGenerator = this.diagnosticRules.get(errorCode);
    if (ruleGenerator) {
      return ruleGenerator(context);
    }

    // Default generic suggestions
    return [
      {
        id: 'generic-retry',
        title: 'Retry the Operation',
        description: 'Sometimes temporary issues can be resolved by retrying.',
        actionType: 'fix',
        confidence: 40,
        estimatedTime: 'immediate',
        steps: ['Try the operation again', 'Check if the issue persists'],
      },
      {
        id: 'generic-documentation',
        title: 'Check Documentation',
        description: 'Review the documentation for this node type.',
        actionType: 'documentation',
        confidence: 60,
        estimatedTime: '5 minutes',
        relatedLinks: [
          {
            title: 'Node Documentation',
            url: '/docs/nodes',
            type: 'documentation',
          },
        ],
      },
    ];
  }

  private findRelatedErrors(nodeId: string, errorCode: ErrorCode): string[] {
    const related: string[] = [];

    // Look for similar errors in other nodes
    for (const [otherNodeId, diagnostics] of this.errorHistory.entries()) {
      if (otherNodeId !== nodeId) {
        const hasRelatedError = diagnostics.some(
          (d) => d.errorCode === errorCode || d.category === this.categorizeError(errorCode)
        );
        if (hasRelatedError) {
          related.push(otherNodeId);
        }
      }
    }

    return related.slice(0, 5); // Limit to 5 related errors
  }

  private addToHistory(nodeId: string, diagnostic: NodeErrorDiagnostic): void {
    const history = this.errorHistory.get(nodeId) || [];
    history.push(diagnostic);

    // Keep only recent history
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.splice(0, history.length - this.MAX_HISTORY_SIZE);
    }

    this.errorHistory.set(nodeId, history);
  }
}
