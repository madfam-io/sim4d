/**
 * Central monitoring system orchestrator
 */

import { MonitoringConfig, ErrorCode, ErrorSeverity } from '../error-handling/types';
import { ErrorManager } from '../error-handling/error-manager';
import { MetricsCollector } from './metrics-collector';
import { HealthMonitor, HealthThresholds, HealthAlert } from './health-monitor';
import { Logger } from '../logging/logger';
import { RetryHandler } from './retry-handler';

export interface MonitoringSystemConfig {
  monitoring: MonitoringConfig;
  healthThresholds: HealthThresholds;
  enabledFeatures: {
    errorReporting: boolean;
    performanceMonitoring: boolean;
    healthChecks: boolean;
    userAnalytics: boolean;
    retryHandling: boolean;
  };
}

export class MonitoringSystem {
  private static instance: MonitoringSystem | null = null;
  private config: MonitoringSystemConfig;
  private errorManager!: ErrorManager;
  private metricsCollector!: MetricsCollector;
  private healthMonitor!: HealthMonitor;
  private logger!: Logger;
  private retryHandler!: RetryHandler;
  private initialized: boolean = false;
  private sessionId: string;

  private constructor(config: MonitoringSystemConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(config?: MonitoringSystemConfig): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      if (!config) {
        throw new Error('MonitoringSystem must be initialized with config on first use');
      }
      MonitoringSystem.instance = new MonitoringSystem(config);
    }
    return MonitoringSystem.instance;
  }

  /**
   * Initialize the monitoring system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🔧 Initializing BrepFlow Monitoring System...');

    try {
      // Initialize logger first
      this.logger = Logger.getInstance(this.config.monitoring.logging, this.sessionId);

      // Initialize error manager
      this.errorManager = ErrorManager.getInstance(this.config.monitoring);

      // Initialize metrics collector
      this.metricsCollector = MetricsCollector.getInstance();

      // Initialize health monitor with alert handler
      this.healthMonitor = HealthMonitor.getInstance(
        this.config.healthThresholds,
        this.handleHealthAlert.bind(this)
      );

      // Initialize retry handler
      this.retryHandler = new RetryHandler();

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      // Start monitoring performance
      if (this.config.enabledFeatures.performanceMonitoring) {
        this.startPerformanceMonitoring();
      }

      // Start user analytics if enabled
      if (this.config.enabledFeatures.userAnalytics) {
        this.startUserAnalytics();
      }

      // Log initialization
      this.logger.info('Monitoring system initialized successfully', {
        sessionId: this.sessionId,
        enabledFeatures: this.config.enabledFeatures,
        version: import.meta.env.VITE_BUILD_VERSION || 'development',
      });

      this.initialized = true;
      console.log('✅ Monitoring System Ready');
    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error);
      throw error;
    }
  }

  /**
   * Create monitored async operation with automatic retry and error handling
   */
  public async executeMonitoredOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      enableRetry?: boolean;
      retryConfig?: {
        maxAttempts?: number;
        backoffStrategy?: 'linear' | 'exponential';
        baseDelay?: number;
      };
      expectedErrors?: ErrorCode[];
      timeout?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log operation start
    this.logger.info('Starting monitored operation', {
      operationName,
      operationId,
      options,
    });

    // Start timing
    const endTiming = this.metricsCollector.startTiming(`operation_duration_ms`);

    try {
      let result: T;

      if (options.enableRetry) {
        // Execute with retry logic
        const retryResult = await this.retryHandler.retryWithExponentialBackoff(operation, {
          maxAttempts: options.retryConfig?.maxAttempts || 3,
          baseDelay: options.retryConfig?.baseDelay || 1000,
          operationName,
        });

        if (!retryResult.success) {
          throw retryResult.error!;
        }

        result = retryResult.result!;

        // Log retry stats if retries occurred
        if (retryResult.attempts > 1) {
          this.logger.info('Operation succeeded with retries', {
            operationName,
            operationId,
            attempts: retryResult.attempts,
            totalTime: retryResult.totalTime,
          });
        }
      } else {
        // Execute directly with timeout if specified
        if (options.timeout) {
          result = await this.executeWithTimeout(operation, options.timeout);
        } else {
          result = await operation();
        }
      }

      // Record success metrics
      const duration = Date.now() - startTime;
      endTiming({ operation: operationName, status: 'success' });

      this.metricsCollector.incrementCounter('operations_total', {
        operation: operationName,
        status: 'success',
      });

      this.logger.info('Operation completed successfully', {
        operationName,
        operationId,
        duration,
      });

      return result;
    } catch (error) {
      // Record failure metrics
      const duration = Date.now() - startTime;
      endTiming({ operation: operationName, status: 'error' });

      this.metricsCollector.incrementCounter('operations_total', {
        operation: operationName,
        status: 'error',
      });

      // Create error through error manager
      const jsError = error instanceof Error ? error : new Error(String(error));
      const errorCode = this.inferErrorCode(jsError, operationName);

      this.errorManager.fromJavaScriptError(jsError, errorCode, {
        context: {
          operationName,
          operationId,
          duration,
          expectedErrors: options.expectedErrors,
        },
      });

      this.logger.error('Operation failed', {
        operationName,
        operationId,
        duration,
        error: jsError.message,
        stack: jsError.stack,
      });

      throw error;
    }
  }

  /**
   * Monitor WASM operation specifically
   */
  public async executeWasmOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'wasm_operation'
  ): Promise<T> {
    return this.executeMonitoredOperation(operation, operationName, {
      enableRetry: true,
      retryConfig: {
        maxAttempts: 2,
        baseDelay: 500,
      },
      expectedErrors: [ErrorCode.WASM_EXECUTION_ERROR, ErrorCode.GEOMETRY_COMPUTATION_FAILED],
      timeout: 30000, // 30 second timeout for WASM operations
    });
  }

  /**
   * Monitor network operation specifically
   */
  public async executeNetworkOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'network_operation'
  ): Promise<T> {
    return this.executeMonitoredOperation(operation, operationName, {
      enableRetry: true,
      retryConfig: {
        maxAttempts: 5,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
      },
      expectedErrors: [
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.API_REQUEST_FAILED,
        ErrorCode.CONNECTION_LOST,
      ],
      timeout: 10000, // 10 second timeout
    });
  }

  /**
   * Get monitoring dashboard data
   */
  public getMonitoringDashboard(): {
    systemHealth: ReturnType<HealthMonitor['getCurrentHealth']>;
    activeErrors: ReturnType<ErrorManager['getActiveErrors']>;
    activeAlerts: HealthAlert[];
    metrics: ReturnType<MetricsCollector['exportMetrics']>;
    retryStats: ReturnType<RetryHandler['getRetryStats']>;
  } {
    return {
      systemHealth: this.healthMonitor.getCurrentHealth(),
      activeErrors: this.errorManager.getActiveErrors(),
      activeAlerts: this.healthMonitor.getActiveAlerts(),
      metrics: this.metricsCollector.exportMetrics(),
      retryStats: this.retryHandler.getRetryStats(),
    };
  }

  /**
   * Record user interaction
   */
  public recordUserInteraction(interaction: {
    type: string;
    target?: string;
    data?: Record<string, any>;
  }): void {
    if (!this.config.enabledFeatures.userAnalytics) {
      return;
    }

    this.metricsCollector.recordUserEvent({
      ...interaction,
      sessionId: this.sessionId,
    });
  }

  /**
   * Create monitoring report for external services
   */
  public createMonitoringReport(): {
    timestamp: number;
    sessionId: string;
    buildVersion: string;
    dashboard: ReturnType<MonitoringSystem['getMonitoringDashboard']>;
    config: MonitoringSystemConfig;
  } {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      buildVersion: import.meta.env.VITE_BUILD_VERSION || 'development',
      dashboard: this.getMonitoringDashboard(),
      config: this.config,
    };
  }

  /**
   * Shutdown monitoring system
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down monitoring system');

    try {
      await this.logger.stop();
      this.metricsCollector.stop();
      this.healthMonitor.stop();

      this.initialized = false;
      this.logger.info('Monitoring system shutdown complete');
    } catch (error) {
      console.error('Error during monitoring system shutdown:', error);
    }
  }

  /**
   * Handle health alerts
   */
  private handleHealthAlert(alert: HealthAlert): void {
    this.logger.warn('Health alert triggered', { alert });

    // Create error for critical alerts
    if (alert.severity === 'critical') {
      this.errorManager.createError(this.getErrorCodeForAlertType(alert.type), alert.message, {
        severity: ErrorSeverity.HIGH,
        userMessage: this.getUserMessageForAlert(alert),
        context: {
          alertType: alert.type,
          alertId: alert.id,
        },
      });
    }

    // Emit event for UI components to handle
    window.dispatchEvent(
      new CustomEvent('brepflow:health-alert', {
        detail: alert,
      })
    );
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // These are already set up in ErrorManager, but we can add additional handling here
    window.addEventListener('brepflow:monitoring-event', (event: any) => {
      this.logger.info('Custom monitoring event', { event: event.detail });
    });
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = Date.now();

    const measureFrameRate = () => {
      frameCount++;
      const now = Date.now();

      if (now - lastTime >= 1000) {
        this.metricsCollector.setGauge('fps', frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.metricsCollector.incrementCounter('page_visibility_changes', {
        state: document.hidden ? 'hidden' : 'visible',
      });
    });
  }

  /**
   * Start user analytics
   */
  private startUserAnalytics(): void {
    // Track mouse movements (sampled)
    let lastMouseEvent = 0;
    document.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMouseEvent > 5000) {
        // Sample every 5 seconds
        this.metricsCollector.incrementCounter('user_mouse_movements');
        lastMouseEvent = now;
      }
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      this.recordUserInteraction({
        type: 'click',
        target: (event.target as Element)?.tagName?.toLowerCase(),
        data: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    });

    // Track keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        this.recordUserInteraction({
          type: 'keyboard_shortcut',
          data: {
            key: event.key,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
          },
        });
      }
    });
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Infer error code from operation context
   */
  private inferErrorCode(error: Error, operationName: string): ErrorCode {
    const message = error.message.toLowerCase();
    const name = operationName.toLowerCase();

    if (name.includes('wasm') || message.includes('wasm')) {
      return ErrorCode.WASM_EXECUTION_ERROR;
    }
    if (name.includes('geometry') || message.includes('geometry')) {
      return ErrorCode.GEOMETRY_COMPUTATION_FAILED;
    }
    if (name.includes('network') || message.includes('fetch')) {
      return ErrorCode.API_REQUEST_FAILED;
    }
    if (message.includes('timeout')) {
      return ErrorCode.EVALUATION_TIMEOUT;
    }

    return ErrorCode.RUNTIME;
  }

  /**
   * Get error code for health alert type
   */
  private getErrorCodeForAlertType(alertType: HealthAlert['type']): ErrorCode {
    switch (alertType) {
      case 'memory':
        return ErrorCode.MEMORY_LIMIT_EXCEEDED;
      case 'wasm':
        return ErrorCode.WASM_EXECUTION_ERROR;
      case 'network':
        return ErrorCode.CONNECTION_LOST;
      case 'error_rate':
        return ErrorCode.RUNTIME;
      case 'performance':
        return ErrorCode.EVALUATION_TIMEOUT;
      default:
        return ErrorCode.SYSTEM;
    }
  }

  /**
   * Get user-friendly message for health alert
   */
  private getUserMessageForAlert(alert: HealthAlert): string {
    switch (alert.type) {
      case 'memory':
        return 'The application is using too much memory. Consider refreshing the page or closing other browser tabs.';
      case 'wasm':
        return 'The geometry engine is experiencing issues. Some features may not work correctly.';
      case 'network':
        return 'Network connection issues detected. Some features may not work properly.';
      case 'error_rate':
        return 'Multiple errors are occurring. Please refresh the page or contact support.';
      case 'performance':
        return 'The application is running slowly. This may be due to complex operations or system load.';
      default:
        return 'A system issue has been detected. Please refresh the page if problems persist.';
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
