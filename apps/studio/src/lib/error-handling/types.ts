/**
 * Comprehensive error handling types for Sim4D Studio
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  GEOMETRY = 'geometry',
  WASM = 'wasm',
  NETWORK = 'network',
  VALIDATION = 'validation',
  RUNTIME = 'runtime',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
  UI = 'ui',
}

export enum ErrorCode {
  // Geometry errors
  GEOMETRY_COMPUTATION_FAILED = 'GEOMETRY_COMPUTATION_FAILED',
  INVALID_GEOMETRY_PARAMETERS = 'INVALID_GEOMETRY_PARAMETERS',
  GEOMETRY_ENGINE_NOT_INITIALIZED = 'GEOMETRY_ENGINE_NOT_INITIALIZED',

  // WASM errors
  WASM_MODULE_LOAD_FAILED = 'WASM_MODULE_LOAD_FAILED',
  WASM_EXECUTION_ERROR = 'WASM_EXECUTION_ERROR',
  SHARED_ARRAY_BUFFER_NOT_AVAILABLE = 'SHARED_ARRAY_BUFFER_NOT_AVAILABLE',

  // Network errors
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  CONNECTION_LOST = 'CONNECTION_LOST',

  // Validation errors
  INVALID_NODE_CONNECTION = 'INVALID_NODE_CONNECTION',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  MISSING_REQUIRED_INPUT = 'MISSING_REQUIRED_INPUT',

  // Runtime errors
  RUNTIME = 'RUNTIME',
  EVALUATION_TIMEOUT = 'EVALUATION_TIMEOUT',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  WORKER_THREAD_CRASHED = 'WORKER_THREAD_CRASHED',

  // User input errors
  INVALID_PARAMETER_VALUE = 'INVALID_PARAMETER_VALUE',
  FILE_IMPORT_FAILED = 'FILE_IMPORT_FAILED',
  UNSUPPORTED_FILE_FORMAT = 'UNSUPPORTED_FILE_FORMAT',

  // System errors
  SYSTEM = 'SYSTEM',
  LOCAL_STORAGE_QUOTA_EXCEEDED = 'LOCAL_STORAGE_QUOTA_EXCEEDED',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  PERMISSIONS_DENIED = 'PERMISSIONS_DENIED',

  // UI errors
  COMPONENT_RENDER_ERROR = 'COMPONENT_RENDER_ERROR',
  EVENT_HANDLER_ERROR = 'EVENT_HANDLER_ERROR',
  LAYOUT_UPDATE_FAILED = 'LAYOUT_UPDATE_FAILED',
}

export interface ErrorContext {
  nodeId?: string;
  operationType?: string;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  buildVersion: string;
  additionalData?: Record<string, unknown>;
  // Additional properties used in components
  componentStack?: string;
  filename?: string;
  rejectionType?: string;
  errorName?: string;
  operationName?: string;
  operationId?: string;
  wasmSupport?: boolean;
  evaluationDuration?: number;
  alertType?: string;
  alertId?: string;
  initializationAttempt?: number;
  nodeCount?: number;
  memoryUsage?: number;
  // Additional missing properties
  lineno?: number;
  colno?: number;
  duration?: number;
  edgeCount?: number;
  expectedErrors?: ErrorCode[];
  wasmRelated?: boolean;
  geometryOperation?: boolean;
  asyncError?: boolean;
  errorBoundary?: string;
}

export interface Sim4DError {
  id: string;
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalDetails?: string;
  userMessage: string;
  context: ErrorContext;
  recoverable: boolean;
  recoveryActions?: RecoveryAction[];
  reportedToService?: boolean;
  occurredAt: Date;
  resolvedAt?: Date;
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<boolean> | boolean;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface UserEvent {
  type: string;
  target?: string;
  data?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface SystemHealth {
  memoryUsage: number;
  wasmMemoryUsage?: number;
  activeWorkers: number;
  errorRate: number;
  averageResponseTime: number;
  lastHealthCheck: number;
}

// Configuration interfaces
export interface MonitoringConfig {
  errorReporting: {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
    sampleRate: number;
    includeStackTrace: boolean;
  };
  performance: {
    enabled: boolean;
    sampleRate: number;
    endpoint?: string;
  };
  userAnalytics: {
    enabled: boolean;
    endpoint?: string;
    anonymize: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    remote: boolean;
    structured: boolean;
  };
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
  retryableErrors: ErrorCode[];
}

// Monitoring system configurations
export interface MonitoringSystemConfig {
  enabled: boolean;
  config: MonitoringConfig;
  retryConfig: RetryConfig;
  enableDebugMode?: boolean;
}

export interface MonitoringSystem {
  initialize(config: MonitoringSystemConfig): Promise<void>;
  reportError(error: Sim4DError): void;
  recordMetric(metric: PerformanceMetric): void;
  recordUserEvent(event: UserEvent): void;
  getSystemHealth(): SystemHealth;
  shutdown(): Promise<void>;
}
