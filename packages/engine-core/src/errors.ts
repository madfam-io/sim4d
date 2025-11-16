/**
 * Application-level error types for geometry evaluation so callers can
 * differentiate between DAG orchestration failures and OCCT worker faults.
 */

export interface GeometryErrorContext {
  nodeId: string;
  nodeType: string;
  durationMs?: number;
  operation?: string;
  inputs?: string[];
  params?: Record<string, unknown>;
}

export interface GeometryErrorDiagnostic extends GeometryErrorContext {
  message: string;
  code?: string;
  cause?: unknown;
}

export class GeometryEvaluationError extends Error {
  readonly nodeId: string;
  readonly nodeType: string;
  readonly durationMs?: number;
  readonly operation?: string;
  readonly code?: string;
  readonly cause?: unknown;
  readonly inputs?: string[];
  readonly params?: Record<string, unknown>;

  constructor(message: string, diagnostic: GeometryErrorDiagnostic) {
    super(message);
    this.name = 'GeometryEvaluationError';
    this.nodeId = diagnostic.nodeId;
    this.nodeType = diagnostic.nodeType;
    this.durationMs = diagnostic.durationMs;
    this.operation = diagnostic.operation;
    this.code = diagnostic.code;
    this.cause = diagnostic.cause;
    this.inputs = diagnostic.inputs;
    this.params = diagnostic.params;
  }

  static fromUnknown(error: unknown, context: GeometryErrorContext): GeometryEvaluationError {
    if (error instanceof GeometryEvaluationError) {
      return error;
    }

    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown geometry evaluation failure';

    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code)
        : undefined;

    return new GeometryEvaluationError(message, {
      ...context,
      message,
      code,
      cause: error,
    });
  }

  toDiagnostic(): GeometryErrorDiagnostic {
    return {
      nodeId: this.nodeId,
      nodeType: this.nodeType,
      durationMs: this.durationMs,
      operation: this.operation,
      inputs: this.inputs,
      params: this.params,
      message: this.message,
      code: this.code,
      cause: this.cause,
    };
  }
}
