/**
 * Central error management system for BrepFlow Studio
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BrepFlowError,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  RecoveryAction,
  MonitoringConfig,
} from './types';
import { Logger } from '../logging/logger';
import { MetricsCollector } from '../monitoring/metrics-collector';

// Simple browser-compatible EventEmitter
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(...args));
    }
  }

  off(event: string, callback?: Function) {
    if (!this.events[event]) return;

    if (callback) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    } else {
      delete this.events[event];
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export class ErrorManager extends SimpleEventEmitter {
  private static instance: ErrorManager | null = null;
  private errors: Map<string, BrepFlowError> = new Map();
  private config: MonitoringConfig;
  private logger: Logger;
  private metrics: MetricsCollector;
  private sessionId: string;
  private buildVersion: string;

  private constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.logger = Logger.getInstance();
    this.metrics = MetricsCollector.getInstance();
    this.sessionId = uuidv4();
    this.buildVersion = import.meta.env.VITE_BUILD_VERSION || 'development';

    this.setupErrorHandlers();
  }

  public static getInstance(config?: MonitoringConfig): ErrorManager {
    if (!ErrorManager.instance) {
      if (!config) {
        throw new Error('ErrorManager must be initialized with config on first use');
      }
      ErrorManager.instance = new ErrorManager(config);
    }
    return ErrorManager.instance;
  }

  /**
   * Create and register a new error
   */
  public createError(
    code: ErrorCode,
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      technicalDetails?: string;
      userMessage?: string;
      context?: Partial<ErrorContext>;
      recoverable?: boolean;
      recoveryActions?: RecoveryAction[];
    } = {}
  ): BrepFlowError {
    const error: BrepFlowError = {
      id: uuidv4(),
      code,
      category: options.category || this.inferCategory(code),
      severity: options.severity || this.inferSeverity(code),
      message,
      technicalDetails: options.technicalDetails,
      userMessage: options.userMessage || this.generateUserMessage(code, message),
      context: {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...options.context,
      },
      recoverable: options.recoverable ?? this.isRecoverable(code),
      recoveryActions: options.recoveryActions || this.getDefaultRecoveryActions(code),
      reportedToService: false,
      occurredAt: new Date(),
    };

    this.registerError(error);
    return error;
  }

  /**
   * Register an error and handle reporting/logging
   */
  private registerError(error: BrepFlowError): void {
    this.errors.set(error.id, error);
    this.emit('error', error);

    // Log the error
    this.logger.error('Error occurred', {
      errorId: error.id,
      code: error.code,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
    });

    // Update metrics
    this.metrics.incrementCounter('errors_total', {
      code: error.code,
      category: error.category,
      severity: error.severity,
    });

    // Report to external service if configured
    if (this.config.errorReporting.enabled) {
      this.reportErrorToService(error);
    }

    // Handle critical errors immediately
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(error);
    }
  }

  /**
   * Handle JavaScript errors and promise rejections
   */
  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.createError(ErrorCode.RUNTIME, event.message, {
        category: ErrorCategory.RUNTIME,
        severity: ErrorSeverity.HIGH,
        technicalDetails: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.createError(ErrorCode.RUNTIME, `Unhandled promise rejection: ${event.reason}`, {
        category: ErrorCategory.RUNTIME,
        severity: ErrorSeverity.HIGH,
        technicalDetails: event.reason?.stack || String(event.reason),
        context: {
          rejectionType: 'unhandled_promise',
        },
      });
    });
  }

  /**
   * Create error from JavaScript Error object
   */
  public fromJavaScriptError(
    error: Error,
    code: ErrorCode = ErrorCode.RUNTIME,
    options: Partial<Parameters<typeof this.createError>[2]> = {}
  ): BrepFlowError {
    return this.createError(code, error.message, {
      ...options,
      technicalDetails: error.stack,
      context: {
        ...options.context,
        errorName: error.name,
      },
    });
  }

  /**
   * Resolve an error
   */
  public resolveError(errorId: string): void {
    const error = this.errors.get(errorId);
    if (error && !error.resolvedAt) {
      error.resolvedAt = new Date();
      this.emit('errorResolved', error);

      this.logger.info('Error resolved', { errorId });
      this.metrics.incrementCounter('errors_resolved_total', {
        code: error.code,
        category: error.category,
      });
    }
  }

  /**
   * Get all errors
   */
  public getErrors(): BrepFlowError[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get active (unresolved) errors
   */
  public getActiveErrors(): BrepFlowError[] {
    return this.getErrors().filter((error) => !error.resolvedAt);
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorSeverity): BrepFlowError[] {
    return this.getErrors().filter((error) => error.severity === severity);
  }

  /**
   * Clear resolved errors older than specified time
   */
  public clearOldErrors(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    const toDelete: string[] = [];

    for (const [id, error] of this.errors) {
      if (error.resolvedAt && error.resolvedAt.getTime() < cutoff) {
        toDelete.push(id);
      }
    }

    toDelete.forEach((id) => this.errors.delete(id));
  }

  /**
   * Execute recovery action
   */
  public async executeRecoveryAction(errorId: string, actionId: string): Promise<boolean> {
    const error = this.errors.get(errorId);
    if (!error) return false;

    const action = error.recoveryActions?.find((a) => a.id === actionId);
    if (!action) return false;

    try {
      const result = await action.action();

      if (result) {
        this.resolveError(errorId);
        this.logger.info('Recovery action successful', { errorId, actionId });
      }

      return result;
    } catch (recoveryError) {
      this.logger.error('Recovery action failed', {
        errorId,
        actionId,
        recoveryError:
          recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
      });
      return false;
    }
  }

  /**
   * Report error to external monitoring service
   */
  private async reportErrorToService(error: BrepFlowError): Promise<void> {
    if (!this.config.errorReporting.endpoint || !this.config.errorReporting.apiKey) {
      return;
    }

    // Sample rate check
    if (Math.random() > this.config.errorReporting.sampleRate) {
      return;
    }

    try {
      await fetch(this.config.errorReporting.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.errorReporting.apiKey}`,
        },
        body: JSON.stringify({
          ...error,
          stackTrace: this.config.errorReporting.includeStackTrace
            ? error.technicalDetails
            : undefined,
        }),
      });

      error.reportedToService = true;
    } catch (reportError) {
      this.logger.warn('Failed to report error to service', {
        errorId: error.id,
        reportError: reportError instanceof Error ? reportError.message : String(reportError),
      });
    }
  }

  /**
   * Handle critical errors that require immediate attention
   */
  private handleCriticalError(error: BrepFlowError): void {
    // Show notification to user
    this.emit('criticalError', error);

    // Could trigger fallback modes, save state, etc.
    this.logger.error('CRITICAL ERROR OCCURRED', {
      errorId: error.id,
      code: error.code,
      message: error.message,
    });
  }

  /**
   * Infer error category from error code
   */
  private inferCategory(code: ErrorCode): ErrorCategory {
    const codeString = code.toString();

    if (codeString.includes('GEOMETRY')) return ErrorCategory.GEOMETRY;
    if (codeString.includes('WASM')) return ErrorCategory.WASM;
    if (codeString.includes('NETWORK') || codeString.includes('API')) return ErrorCategory.NETWORK;
    if (codeString.includes('VALIDATION')) return ErrorCategory.VALIDATION;
    if (codeString.includes('INPUT')) return ErrorCategory.USER_INPUT;
    if (codeString.includes('SYSTEM') || codeString.includes('BROWSER'))
      return ErrorCategory.SYSTEM;
    if (codeString.includes('UI') || codeString.includes('COMPONENT')) return ErrorCategory.UI;

    return ErrorCategory.RUNTIME;
  }

  /**
   * Infer error severity from error code
   */
  private inferSeverity(code: ErrorCode): ErrorSeverity {
    const criticalCodes = [
      ErrorCode.WASM_MODULE_LOAD_FAILED,
      ErrorCode.MEMORY_LIMIT_EXCEEDED,
      ErrorCode.WORKER_THREAD_CRASHED,
    ];

    const highCodes = [
      ErrorCode.GEOMETRY_ENGINE_NOT_INITIALIZED,
      ErrorCode.EVALUATION_TIMEOUT,
      ErrorCode.CONNECTION_LOST,
    ];

    const lowCodes = [ErrorCode.INVALID_PARAMETER_VALUE, ErrorCode.LAYOUT_UPDATE_FAILED];

    if (criticalCodes.includes(code)) return ErrorSeverity.CRITICAL;
    if (highCodes.includes(code)) return ErrorSeverity.HIGH;
    if (lowCodes.includes(code)) return ErrorSeverity.LOW;

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(code: ErrorCode, technicalMessage: string): string {
    const userMessages: Record<ErrorCode, string> = {
      // Geometry errors
      [ErrorCode.GEOMETRY_COMPUTATION_FAILED]:
        'Unable to compute geometry. Please check your parameters and try again.',
      [ErrorCode.INVALID_GEOMETRY_PARAMETERS]:
        'Invalid geometry parameters provided. Please check your input values.',
      [ErrorCode.GEOMETRY_ENGINE_NOT_INITIALIZED]:
        'Geometry engine is not ready. Please wait and try again.',

      // WASM errors
      [ErrorCode.WASM_MODULE_LOAD_FAILED]:
        'Failed to load the geometry engine. Please refresh the page.',
      [ErrorCode.WASM_EXECUTION_ERROR]:
        'Geometry processing failed. Please try a different approach.',
      [ErrorCode.SHARED_ARRAY_BUFFER_NOT_AVAILABLE]:
        'Advanced features are disabled due to browser security settings.',

      // Network errors
      [ErrorCode.API_REQUEST_FAILED]:
        'Network request failed. Please check your connection and try again.',
      [ErrorCode.NETWORK_TIMEOUT]:
        'Network request timed out. Please check your connection and try again.',
      [ErrorCode.CONNECTION_LOST]: 'Connection lost. Please check your network and try again.',

      // Validation errors
      [ErrorCode.INVALID_NODE_CONNECTION]:
        'Invalid node connection. Please check that input and output types match.',
      [ErrorCode.CIRCULAR_DEPENDENCY]:
        'Circular dependency detected in the node graph. Please remove the circular connection.',
      [ErrorCode.MISSING_REQUIRED_INPUT]:
        'Required input is missing. Please provide all necessary inputs.',

      // Runtime errors
      [ErrorCode.RUNTIME]: 'A runtime error occurred. Please try again.',
      [ErrorCode.EVALUATION_TIMEOUT]: 'Operation timed out. Please try with simpler parameters.',
      [ErrorCode.MEMORY_LIMIT_EXCEEDED]:
        'Out of memory. Please close other tabs or refresh the page.',
      [ErrorCode.WORKER_THREAD_CRASHED]: 'Processing thread crashed. Please refresh the page.',

      // User input errors
      [ErrorCode.INVALID_PARAMETER_VALUE]: 'Invalid parameter value. Please check your input.',
      [ErrorCode.FILE_IMPORT_FAILED]:
        'Failed to import file. Please check the file format and try again.',
      [ErrorCode.UNSUPPORTED_FILE_FORMAT]:
        'File format not supported. Please use a supported format.',

      // System errors
      [ErrorCode.SYSTEM]: 'A system error occurred. Please refresh the page.',
      [ErrorCode.LOCAL_STORAGE_QUOTA_EXCEEDED]:
        'Storage limit exceeded. Please clear browser data.',
      [ErrorCode.BROWSER_NOT_SUPPORTED]:
        'Your browser is not supported. Please use a modern browser.',
      [ErrorCode.PERMISSIONS_DENIED]: 'Permission denied. Please check your browser settings.',

      // UI errors
      [ErrorCode.COMPONENT_RENDER_ERROR]: 'Component failed to render. Please refresh the page.',
      [ErrorCode.EVENT_HANDLER_ERROR]: 'An interaction error occurred. Please try again.',
      [ErrorCode.LAYOUT_UPDATE_FAILED]: 'Layout update failed. Please refresh the page.',
    };

    return userMessages[code] || `An error occurred: ${technicalMessage}`;
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(code: ErrorCode): boolean {
    const nonRecoverableCodes = [
      ErrorCode.WASM_MODULE_LOAD_FAILED,
      ErrorCode.BROWSER_NOT_SUPPORTED,
      ErrorCode.MEMORY_LIMIT_EXCEEDED,
    ];

    return !nonRecoverableCodes.includes(code);
  }

  /**
   * Get default recovery actions for error code
   */
  private getDefaultRecoveryActions(code: ErrorCode): RecoveryAction[] {
    const basicRetry = {
      id: 'retry',
      label: 'Retry',
      description: 'Try the operation again',
      action: () => true,
    };

    const refresh = {
      id: 'refresh',
      label: 'Refresh Page',
      description: 'Refresh the page to reset the application',
      action: () => {
        window.location.reload();
        return true;
      },
      destructive: true,
      requiresConfirmation: true,
    };

    const actions: Record<ErrorCode, RecoveryAction[]> = {
      // Geometry errors
      [ErrorCode.GEOMETRY_COMPUTATION_FAILED]: [
        basicRetry,
        {
          id: 'reset-parameters',
          label: 'Reset Parameters',
          description: 'Reset node parameters to default values',
          action: () => true,
          requiresConfirmation: true,
        },
      ],
      [ErrorCode.INVALID_GEOMETRY_PARAMETERS]: [
        {
          id: 'fix-parameters',
          label: 'Check Parameters',
          description: 'Review and fix parameter values',
          action: () => true,
        },
      ],
      [ErrorCode.GEOMETRY_ENGINE_NOT_INITIALIZED]: [basicRetry, refresh],

      // WASM errors
      [ErrorCode.WASM_MODULE_LOAD_FAILED]: [refresh],
      [ErrorCode.WASM_EXECUTION_ERROR]: [basicRetry, refresh],
      [ErrorCode.SHARED_ARRAY_BUFFER_NOT_AVAILABLE]: [
        {
          id: 'enable-headers',
          label: 'Enable Headers',
          description: 'Contact administrator to enable COOP/COEP headers',
          action: () => true,
        },
      ],

      // Network errors
      [ErrorCode.API_REQUEST_FAILED]: [basicRetry],
      [ErrorCode.NETWORK_TIMEOUT]: [basicRetry],
      [ErrorCode.CONNECTION_LOST]: [basicRetry],

      // Validation errors
      [ErrorCode.INVALID_NODE_CONNECTION]: [
        {
          id: 'disconnect',
          label: 'Disconnect',
          description: 'Remove invalid connection',
          action: () => true,
        },
      ],
      [ErrorCode.CIRCULAR_DEPENDENCY]: [
        {
          id: 'break-cycle',
          label: 'Break Cycle',
          description: 'Remove circular connection',
          action: () => true,
        },
      ],
      [ErrorCode.MISSING_REQUIRED_INPUT]: [
        {
          id: 'fix-inputs',
          label: 'Fix Inputs',
          description: 'Connect required inputs',
          action: () => true,
        },
      ],

      // Runtime errors
      [ErrorCode.RUNTIME]: [basicRetry, refresh],
      [ErrorCode.EVALUATION_TIMEOUT]: [basicRetry],
      [ErrorCode.MEMORY_LIMIT_EXCEEDED]: [refresh],
      [ErrorCode.WORKER_THREAD_CRASHED]: [refresh],

      // User input errors
      [ErrorCode.INVALID_PARAMETER_VALUE]: [
        {
          id: 'fix-value',
          label: 'Fix Value',
          description: 'Correct the parameter value',
          action: () => true,
        },
      ],
      [ErrorCode.FILE_IMPORT_FAILED]: [basicRetry],
      [ErrorCode.UNSUPPORTED_FILE_FORMAT]: [
        {
          id: 'convert-format',
          label: 'Convert Format',
          description: 'Convert to a supported format',
          action: () => true,
        },
      ],

      // System errors
      [ErrorCode.SYSTEM]: [refresh],
      [ErrorCode.LOCAL_STORAGE_QUOTA_EXCEEDED]: [
        {
          id: 'clear-storage',
          label: 'Clear Storage',
          description: 'Clear browser storage to free space',
          action: () => {
            localStorage.clear();
            return true;
          },
          destructive: true,
          requiresConfirmation: true,
        },
      ],
      [ErrorCode.BROWSER_NOT_SUPPORTED]: [],
      [ErrorCode.PERMISSIONS_DENIED]: [
        {
          id: 'grant-permissions',
          label: 'Grant Permissions',
          description: 'Enable required browser permissions',
          action: () => true,
        },
      ],

      // UI errors
      [ErrorCode.COMPONENT_RENDER_ERROR]: [refresh],
      [ErrorCode.EVENT_HANDLER_ERROR]: [basicRetry],
      [ErrorCode.LAYOUT_UPDATE_FAILED]: [refresh],
    };

    return actions[code] || [basicRetry];
  }
}
