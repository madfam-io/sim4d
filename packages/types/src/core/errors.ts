/**
 * Core error types and error handling infrastructure for BrepFlow
 */

/**
 * Error codes for categorization and handling
 */
export enum ErrorCode {
  // Geometry errors (1000-1999)
  GEOMETRY_INVALID_INPUT = 1001,
  GEOMETRY_OPERATION_FAILED = 1002,
  GEOMETRY_ENGINE_NOT_INITIALIZED = 1003,
  GEOMETRY_WASM_LOAD_FAILED = 1004,
  GEOMETRY_WORKER_CRASHED = 1005,

  // Graph errors (2000-2999)
  GRAPH_INVALID_NODE = 2001,
  GRAPH_INVALID_CONNECTION = 2002,
  GRAPH_CYCLE_DETECTED = 2003,
  GRAPH_EVALUATION_FAILED = 2004,

  // Validation errors (3000-3999)
  VALIDATION_FAILED = 3001,
  VALIDATION_TYPE_MISMATCH = 3002,
  VALIDATION_REQUIRED_MISSING = 3003,
  VALIDATION_CONSTRAINT_VIOLATED = 3004,

  // Network errors (4000-4999)
  NETWORK_TIMEOUT = 4001,
  NETWORK_CONNECTION_LOST = 4002,
  NETWORK_UNAUTHORIZED = 4003,
  NETWORK_SERVER_ERROR = 4004,

  // State errors (5000-5999)
  STATE_INCONSISTENT = 5001,
  STATE_TRANSACTION_FAILED = 5002,
  STATE_UNDO_FAILED = 5003,
  STATE_REDO_FAILED = 5004,

  // Resource errors (6000-6999)
  RESOURCE_NOT_FOUND = 6001,
  RESOURCE_ALREADY_EXISTS = 6002,
  RESOURCE_LOCKED = 6003,
  RESOURCE_QUOTA_EXCEEDED = 6004,

  // System errors (9000-9999)
  SYSTEM_UNKNOWN = 9001,
  SYSTEM_OUT_OF_MEMORY = 9002,
  SYSTEM_INITIALIZATION_FAILED = 9003,
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /**
   * Informational - No action required
   */
  INFO = 'info',

  /**
   * Warning - Potential issue but operation continues
   */
  WARNING = 'warning',

  /**
   * Error - Operation failed but system stable
   */
  ERROR = 'error',

  /**
   * Critical - System instability, immediate action required
   */
  CRITICAL = 'critical',
}

/**
 * Error context for debugging and logging
 */
export interface ErrorContext {
  /**
   * Component where error occurred
   */
  component?: string;

  /**
   * Operation being performed
   */
  operation?: string;

  /**
   * User ID if applicable
   */
  userId?: string;

  /**
   * Session ID if applicable
   */
  sessionId?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * Stack trace
   */
  stackTrace?: string;

  /**
   * Timestamp
   */
  timestamp?: number;
}

/**
 * Base error class for all BrepFlow errors
 */
export class BrepFlowError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {},
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'BrepFlowError';
    this.code = code;
    this.severity = severity;
    this.context = {
      ...context,
      timestamp: context.timestamp || Date.now(),
      stackTrace: context.stackTrace || this.stack,
    };
    this.isRetryable = isRetryable;

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrepFlowError);
    }
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      isRetryable: this.isRetryable,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): BrepFlowError {
    return new BrepFlowError(
      json.message,
      json.code,
      json.severity,
      json.context,
      json.isRetryable
    );
  }
}

/**
 * Geometry-specific errors
 */
export class GeometryError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.GEOMETRY_OPERATION_FAILED,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.ERROR, context, false);
    this.name = 'GeometryError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_FAILED,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.WARNING, context, false);
    this.name = 'ValidationError';
  }
}

/**
 * Network errors
 */
export class NetworkError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.NETWORK_SERVER_ERROR,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.ERROR, context, true);
    this.name = 'NetworkError';
  }
}

/**
 * State management errors
 */
export class StateError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STATE_INCONSISTENT,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.CRITICAL, context, false);
    this.name = 'StateError';
  }
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  /**
   * Attempt to recover from error
   */
  recover(error: BrepFlowError): Promise<void>;

  /**
   * Check if recovery is possible
   */
  canRecover(error: BrepFlowError): boolean;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  /**
   * Handle an error
   */
  handle(error: Error | BrepFlowError): void;

  /**
   * Report error to monitoring service
   */
  report(error: Error | BrepFlowError): Promise<void>;

  /**
   * Log error
   */
  log(error: Error | BrepFlowError): void;
}
