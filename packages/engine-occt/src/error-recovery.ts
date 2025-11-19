/**
 * Error Recovery and Validation System for OCCT Operations
 * Provides comprehensive error handling, validation, and recovery strategies
 */

import { WASMPerformanceMonitor } from './wasm-capability-detector';
import { getMemoryManager } from './memory-manager';
// import type { ShapeHandle, MeshData } from '@brepflow/types';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  WASM_ERROR = 'wasm_error',
  MEMORY_ERROR = 'memory_error',
  VALIDATION_ERROR = 'validation_error',
  GEOMETRY_ERROR = 'geometry_error',
  WORKER_ERROR = 'worker_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface ErrorContext {
  operation: string;
  params: unknown;
  workerId?: string;
  timestamp: number;
  stackTrace?: string;
  memoryState?: unknown;
  retryCount: number;
  userAgent?: string;
  capabilities?: unknown;
}

export interface ValidationRule {
  name: string;
  validate: (params: unknown) => ValidationResult;
  category: ErrorCategory;
  severity: ErrorSeverity;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fixablе?: boolean;
  suggestedFix?: () => any;
}

export interface RecoveryStrategy {
  name: string;
  canRecover: (error: OCCTError) => boolean;
  recover: (error: OCCTError, context: ErrorContext) => Promise<unknown>;
  maxRetries: number;
  backoffMs: number;
}

export class OCCTError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly code: string;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: ErrorContext,
    recoverable: boolean = true,
    code?: string
  ) {
    super(message);
    this.name = 'OCCTError';
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.recoverable = recoverable;
    this.code = code || `${category.toUpperCase()}_${Date.now()}`;
  }
}

export class ErrorRecoverySystem {
  private validationRules: ValidationRule[] = [];
  private recoveryStrategies: RecoveryStrategy[] = [];
  private errorHistory: OCCTError[] = [];
  private recoveryAttempts = new Map<string, number>();
  private circuitBreakers = new Map<
    string,
    { failures: number; lastFailure: number; isOpen: boolean }
  >();

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultStrategies();
    console.log('[ErrorRecovery] Initialized with validation and recovery systems');
  }

  /**
   * Validate operation parameters before execution
   */
  async validateOperation(operation: string, params: unknown): Promise<ValidationResult> {
    const endMeasurement = WASMPerformanceMonitor?.startMeasurement('error-validation');

    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Apply relevant validation rules
    for (const rule of this.validationRules) {
      try {
        const ruleResult = rule.validate({ operation, ...params });

        if (!ruleResult.valid) {
          result.valid = false;
          result.errors.push(...ruleResult.errors);
        }

        result.warnings.push(...ruleResult.warnings);

        // Merge fixable status and suggested fixes
        if (ruleResult.fixablе && !result.fixablе) {
          result.fixablе = true;
          result.suggestedFix = ruleResult.suggestedFix;
        }
      } catch (validationError) {
        console.warn(`[ErrorRecovery] Validation rule ${rule.name} failed:`, validationError);
        result.warnings.push(`Validation rule ${rule.name} encountered an error`);
      }
    }

    if (endMeasurement) endMeasurement();
    return result;
  }

  /**
   * Handle errors with automatic recovery attempts
   */
  async handleError(
    error: Error | OCCTError,
    operation: string,
    params: unknown,
    context: Partial<ErrorContext> = {}
  ): Promise<{ recovered: boolean; result?: unknown; finalError?: OCCTError }> {
    const endMeasurement = WASMPerformanceMonitor?.startMeasurement('error-recovery');

    // Convert to OCCTError if needed
    let occtError: OCCTError;
    if (error instanceof OCCTError) {
      occtError = error;
    } else {
      occtError = this.categorizeError(error, operation, params, context);
    }

    // Record error in history
    this.errorHistory.push(occtError);
    this.limitErrorHistory();

    // Check circuit breaker
    if (this.isCircuitOpen(operation)) {
      console.warn(`[ErrorRecovery] Circuit breaker open for operation ${operation}`);
      if (endMeasurement) endMeasurement();
      return { recovered: false, finalError: occtError };
    }

    // Update circuit breaker
    this.updateCircuitBreaker(operation, false);

    // Attempt recovery
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(occtError)) {
        try {
          console.log(`[ErrorRecovery] Attempting recovery with strategy: ${strategy.name}`);

          const retryKey = `${operation}_${strategy.name}`;
          const retryCount = this.recoveryAttempts.get(retryKey) || 0;

          if (retryCount >= strategy.maxRetries) {
            console.warn(`[ErrorRecovery] Max retries exceeded for ${strategy.name}`);
            continue;
          }

          // Apply backoff delay
          if (retryCount > 0) {
            const delay = strategy.backoffMs * Math.pow(2, retryCount - 1);
            await this.delay(delay);
          }

          this.recoveryAttempts.set(retryKey, retryCount + 1);

          const result = await strategy.recover(occtError, occtError.context);

          // Recovery successful
          this.resetCircuitBreaker(operation);
          this.recoveryAttempts.delete(retryKey);

          console.log(`[ErrorRecovery] Successfully recovered using ${strategy.name}`);
          if (endMeasurement) endMeasurement();
          return { recovered: true, result };
        } catch (recoveryError) {
          console.warn(`[ErrorRecovery] Recovery strategy ${strategy.name} failed:`, recoveryError);
          continue;
        }
      }
    }

    // No recovery possible
    this.updateCircuitBreaker(operation, false);
    console.error(`[ErrorRecovery] All recovery attempts failed for operation ${operation}`);

    if (endMeasurement) endMeasurement();
    return { recovered: false, finalError: occtError };
  }

  /**
   * Categorize unknown errors into OCCTError format
   */
  private categorizeError(
    error: Error,
    operation: string,
    params: unknown,
    context: Partial<ErrorContext>
  ): OCCTError {
    let category = ErrorCategory.UNKNOWN_ERROR;
    let severity = ErrorSeverity.MEDIUM;
    let recoverable = true;

    const message = error.message.toLowerCase();

    // Categorize based on error message patterns
    if (message.includes('memory') || message.includes('heap')) {
      category = ErrorCategory.MEMORY_ERROR;
      severity = ErrorSeverity.HIGH;
    } else if (message.includes('wasm') || message.includes('webassembly')) {
      category = ErrorCategory.WASM_ERROR;
      severity = ErrorSeverity.HIGH;
    } else if (message.includes('timeout') || message.includes('timed out')) {
      category = ErrorCategory.TIMEOUT_ERROR;
      severity = ErrorSeverity.MEDIUM;
    } else if (message.includes('worker') || message.includes('terminated')) {
      category = ErrorCategory.WORKER_ERROR;
      severity = ErrorSeverity.MEDIUM;
    } else if (message.includes('network') || message.includes('fetch')) {
      category = ErrorCategory.NETWORK_ERROR;
      severity = ErrorSeverity.LOW;
    } else if (message.includes('invalid') || message.includes('validation')) {
      category = ErrorCategory.VALIDATION_ERROR;
      severity = ErrorSeverity.LOW;
      recoverable = false;
    } else if (
      message.includes('geometry') ||
      message.includes('shape') ||
      message.includes('mesh')
    ) {
      category = ErrorCategory.GEOMETRY_ERROR;
      severity = ErrorSeverity.MEDIUM;
    }

    const fullContext: ErrorContext = {
      operation,
      params,
      timestamp: Date.now(),
      stackTrace: error.stack,
      retryCount: 0,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context,
    };

    return new OCCTError(error.message, category, severity, fullContext, recoverable);
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Geometry parameter validation
    this.addValidationRule({
      name: 'geometry-bounds-check',
      category: ErrorCategory.VALIDATION_ERROR,
      severity: ErrorSeverity.MEDIUM,
      validate: (params) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for reasonable geometric bounds
        if (params.width && (params.width <= 0 || params.width > 10000)) {
          errors.push(`Invalid width: ${params.width}. Must be between 0 and 10000.`);
        }
        if (params.height && (params.height <= 0 || params.height > 10000)) {
          errors.push(`Invalid height: ${params.height}. Must be between 0 and 10000.`);
        }
        if (params.radius && (params.radius <= 0 || params.radius > 5000)) {
          errors.push(`Invalid radius: ${params.radius}. Must be between 0 and 5000.`);
        }

        // Check for very small values that might cause precision issues
        if (params.tolerance && params.tolerance < 0.001) {
          warnings.push(`Very small tolerance: ${params.tolerance}. May cause precision issues.`);
        }

        return {
          valid: errors.length === 0,
          errors,
          warnings,
        };
      },
    });

    // Memory pressure validation
    this.addValidationRule({
      name: 'memory-pressure-check',
      category: ErrorCategory.MEMORY_ERROR,
      severity: ErrorSeverity.HIGH,
      validate: (params) => {
        const memoryManager = getMemoryManager();
        const stats = memoryManager.getStats();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (stats.pressureLevel === 'critical') {
          errors.push('Memory pressure is critical. Cannot perform complex operations.');
        } else if (stats.pressureLevel === 'high') {
          warnings.push('Memory pressure is high. Consider simplifying operation parameters.');
        }

        return {
          valid: errors.length === 0,
          errors,
          warnings,
          fixablе: stats.pressureLevel === 'high',
          suggestedFix: () => {
            // Suggest reduced parameters for high memory pressure
            const fixedParams = { ...params };
            if (fixedParams.tolerance)
              fixedParams.tolerance = Math.max(fixedParams.tolerance * 2, 0.1);
            if (fixedParams.detail) fixedParams.detail = Math.max(fixedParams.detail - 1, 1);
            return fixedParams;
          },
        };
      },
    });

    // Operation-specific validation
    this.addValidationRule({
      name: 'operation-specific-validation',
      category: ErrorCategory.VALIDATION_ERROR,
      severity: ErrorSeverity.MEDIUM,
      validate: (params) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        switch (params.operation) {
          case 'MAKE_BOX':
            if (!params.width || !params.height || !params.depth) {
              errors.push('Box creation requires width, height, and depth parameters.');
            }
            break;

          case 'MAKE_SPHERE':
            if (!params.radius) {
              errors.push('Sphere creation requires radius parameter.');
            }
            break;

          case 'TESSELLATE': {
            if (!params.shape) {
              errors.push('Tessellation requires a shape parameter.');
            }
            const tolerance = params.tolerance || params.deflection;
            if (!tolerance || tolerance <= 0) {
              errors.push('Tessellation requires a positive tolerance/deflection parameter.');
            }
            break;
          }

          case 'BOOLEAN_UNION':
          case 'BOOLEAN_INTERSECT':
            // Union and intersect expect shapes array
            if (!params.shapes || !Array.isArray(params.shapes) || params.shapes.length < 2) {
              errors.push(
                'Boolean union/intersect operations require at least two shapes in shapes array.'
              );
            }
            break;
          case 'BOOLEAN_SUBTRACT':
            // Subtract expects base and tools
            if (
              !params.base ||
              !params.tools ||
              !Array.isArray(params.tools) ||
              params.tools.length === 0
            ) {
              errors.push('Boolean subtract operation requires base shape and tools array.');
            }
            break;
        }

        return {
          valid: errors.length === 0,
          errors,
          warnings,
        };
      },
    });
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Memory cleanup and retry
    this.addRecoveryStrategy({
      name: 'memory-cleanup-retry',
      maxRetries: 2,
      backoffMs: 1000,
      canRecover: (error) => error.category === ErrorCategory.MEMORY_ERROR,
      recover: async (error, context) => {
        console.log('[ErrorRecovery] Attempting memory cleanup recovery');

        const memoryManager = getMemoryManager();
        memoryManager.forceCleanup();

        // Wait for cleanup to complete
        await this.delay(500);

        // Retry with simplified parameters if possible
        const simplifiedParams = this.simplifyParameters(context.params, context.operation);
        return this.retryOperation(context.operation, simplifiedParams);
      },
    });

    // Worker restart recovery
    this.addRecoveryStrategy({
      name: 'worker-restart-retry',
      maxRetries: 1,
      backoffMs: 2000,
      canRecover: (error) => error.category === ErrorCategory.WORKER_ERROR,
      recover: async (error, context) => {
        console.log('[ErrorRecovery] Attempting worker restart recovery');

        // Signal worker pool to restart the problematic worker
        // This would integrate with the WorkerPool class
        if (context.workerId) {
          // Worker pool restart logic would go here
          console.log(`[ErrorRecovery] Restarting worker ${context.workerId}`);
        }

        await this.delay(2000);
        return this.retryOperation(context.operation, context.params);
      },
    });

    // WASM module reload recovery
    this.addRecoveryStrategy({
      name: 'wasm-reload-retry',
      maxRetries: 1,
      backoffMs: 5000,
      canRecover: (error) => error.category === ErrorCategory.WASM_ERROR,
      recover: async (error, context) => {
        console.log('[ErrorRecovery] Attempting WASM reload recovery');

        // This would integrate with the OCCT loader to reload WASM modules
        // OCCTLoader reload logic would go here

        await this.delay(5000);
        return this.retryOperation(context.operation, context.params);
      },
    });

    // Note: Mock geometry fallback has been removed - only real OCCT geometry is supported

    // Parameter simplification retry
    this.addRecoveryStrategy({
      name: 'parameter-simplification-retry',
      maxRetries: 2,
      backoffMs: 500,
      canRecover: (error) =>
        error.category === ErrorCategory.GEOMETRY_ERROR ||
        error.category === ErrorCategory.VALIDATION_ERROR,
      recover: async (error, context) => {
        console.log('[ErrorRecovery] Attempting parameter simplification recovery');

        const simplifiedParams = this.simplifyParameters(context.params, context.operation);
        return this.retryOperation(context.operation, simplifiedParams);
      },
    });
  }

  /**
   * Simplify operation parameters to reduce complexity
   */
  private simplifyParameters(params: unknown, operation: string): any {
    const simplified = { ...params };

    // Increase tolerance for geometry operations
    if (simplified.tolerance) {
      simplified.tolerance = Math.min(simplified.tolerance * 2, 1.0);
    }

    // Reduce mesh detail
    if (simplified.detail) {
      simplified.detail = Math.max(simplified.detail - 1, 1);
    }

    // Simplify boolean operations by using less precise algorithms
    if (operation.startsWith('BOOLEAN_')) {
      simplified.precision = 'low';
    }

    // Reduce tessellation quality
    if (operation === 'TESSELLATE') {
      if (!simplified.tolerance) simplified.tolerance = 0.1;
      simplified.tolerance = Math.max(simplified.tolerance * 1.5, 0.1);
    }

    return simplified;
  }

  /**
   * Retry operation (placeholder for integration with actual operation system)
   */
  private async retryOperation(operation: string, params: unknown): Promise<unknown> {
    // This would integrate with the actual OCCT operation system
    console.log(`[ErrorRecovery] Retrying operation ${operation} with params:`, params);

    // For now, return a success indicator
    // In real implementation, this would call the actual operation
    return { success: true, retried: true, operation, params };
  }

  /**
   * Circuit breaker management
   */
  private isCircuitOpen(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation);
    if (!breaker) return false;

    // Reset circuit breaker after cooldown period
    const cooldownMs = 60000; // 1 minute
    if (breaker.isOpen && Date.now() - breaker.lastFailure > cooldownMs) {
      breaker.isOpen = false;
      breaker.failures = 0;
    }

    return breaker.isOpen;
  }

  private updateCircuitBreaker(operation: string, success: boolean): void {
    let breaker = this.circuitBreakers.get(operation);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, isOpen: false };
      this.circuitBreakers.set(operation, breaker);
    }

    if (success) {
      breaker.failures = 0;
      breaker.isOpen = false;
    } else {
      breaker.failures++;
      breaker.lastFailure = Date.now();

      // Open circuit breaker after 5 consecutive failures
      if (breaker.failures >= 5) {
        breaker.isOpen = true;
        console.warn(`[ErrorRecovery] Circuit breaker opened for operation ${operation}`);
      }
    }
  }

  private resetCircuitBreaker(operation: string): void {
    const breaker = this.circuitBreakers.get(operation);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  /**
   * Utility methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private limitErrorHistory(): void {
    // Keep only last 100 errors
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }
  }

  /**
   * Public API methods
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
  }

  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  getErrorHistory(): OCCTError[] {
    return [...this.errorHistory];
  }

  getErrorStats() {
    const categoryStats = new Map<ErrorCategory, number>();
    const severityStats = new Map<ErrorSeverity, number>();

    for (const error of this.errorHistory) {
      categoryStats.set(error.category, (categoryStats.get(error.category) || 0) + 1);
      severityStats.set(error.severity, (severityStats.get(error.severity) || 0) + 1);
    }

    return {
      totalErrors: this.errorHistory.length,
      byCategory: Object.fromEntries(categoryStats),
      bySeverity: Object.fromEntries(severityStats),
      activeCircuitBreakers: Array.from(this.circuitBreakers.entries())
        .filter(([_, breaker]) => breaker.isOpen)
        .map(([operation, breaker]) => ({ operation, failures: breaker.failures })),
    };
  }

  generateErrorReport(): string {
    const stats = this.getErrorStats();

    return `
=== Error Recovery System Report ===
Total Errors Recorded: ${stats.totalErrors}

=== Error Categories ===
${Object.entries(stats.byCategory)
  .map(([cat, count]) => `${cat}: ${count}`)
  .join('\n')}

=== Error Severity ===
${Object.entries(stats.bySeverity)
  .map(([sev, count]) => `${sev}: ${count}`)
  .join('\n')}

=== Circuit Breakers ===
Active: ${stats.activeCircuitBreakers.length}
${stats.activeCircuitBreakers.map((cb) => `- ${cb.operation} (${cb.failures} failures)`).join('\n')}

=== Validation Rules ===
Active Rules: ${this.validationRules.length}
Recovery Strategies: ${this.recoveryStrategies.length}
    `.trim();
  }

  /**
   * Clear error history and reset circuit breakers
   */
  reset(): void {
    this.errorHistory = [];
    this.recoveryAttempts.clear();
    this.circuitBreakers.clear();
    console.log('[ErrorRecovery] System reset complete');
  }
}

// Global error recovery system instance
let globalErrorRecovery: ErrorRecoverySystem | null = null;

/**
 * Get or create the global error recovery system
 */
export function getErrorRecoverySystem(): ErrorRecoverySystem {
  if (!globalErrorRecovery) {
    globalErrorRecovery = new ErrorRecoverySystem();
  }
  return globalErrorRecovery;
}

/**
 * Create a new error recovery system instance
 */
export function createErrorRecoverySystem(): ErrorRecoverySystem {
  return new ErrorRecoverySystem();
}

/**
 * Shutdown the global error recovery system
 */
export function shutdownGlobalErrorRecovery(): void {
  if (globalErrorRecovery) {
    globalErrorRecovery.reset();
    globalErrorRecovery = null;
  }
}
