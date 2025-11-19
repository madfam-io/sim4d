/**
 * Retry logic for handling transient errors
 */

import { RetryConfig, ErrorCode } from '../error-handling/types';
import { Logger } from '../logging/logger';
import { MetricsCollector } from './metrics-collector';

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  lastError?: Error;
  operation: string;
  startTime: number;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export class RetryHandler {
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor() {
    this.logger = Logger.getInstance();
    this.metrics = MetricsCollector.getInstance();
  }

  /**
   * Execute operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    operationName: string = 'unknown'
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    const context: RetryContext = {
      attempt: 0,
      maxAttempts: config.maxAttempts,
      operation: operationName,
      startTime,
    };

    this.logger.debug('Starting retry operation', {
      operation: operationName,
      config,
    });

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      context.attempt = attempt;
      context.lastError = lastError;

      try {
        this.logger.debug('Executing operation attempt', {
          operation: operationName,
          attempt,
          maxAttempts: config.maxAttempts,
        });

        const result = await operation();

        // Success
        const totalTime = Date.now() - startTime;

        this.logger.info('Operation succeeded', {
          operation: operationName,
          attempt,
          totalTime,
        });

        this.metrics.incrementCounter('retry_operations_succeeded', {
          operation: operationName,
          attempt: attempt.toString(),
        });

        this.metrics.recordTiming('retry_operation_duration_ms', totalTime, {
          operation: operationName,
          status: 'success',
        });

        return {
          success: true,
          result,
          attempts: attempt,
          totalTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        this.logger.warn('Operation attempt failed', {
          operation: operationName,
          attempt,
          error: lastError.message,
          stack: lastError.stack,
        });

        // Check if error is retryable
        if (!this.isRetryableError(lastError, config)) {
          this.logger.error('Non-retryable error encountered', {
            operation: operationName,
            error: lastError.message,
          });

          this.metrics.incrementCounter('retry_operations_failed', {
            operation: operationName,
            reason: 'non_retryable',
          });

          const totalTime = Date.now() - startTime;
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime,
          };
        }

        // If this was the last attempt, fail
        if (attempt === config.maxAttempts) {
          const totalTime = Date.now() - startTime;

          this.logger.error('Operation failed after all retry attempts', {
            operation: operationName,
            attempts: config.maxAttempts,
            totalTime,
            finalError: lastError.message,
          });

          this.metrics.incrementCounter('retry_operations_failed', {
            operation: operationName,
            reason: 'max_attempts',
          });

          this.metrics.recordTiming('retry_operation_duration_ms', totalTime, {
            operation: operationName,
            status: 'failed',
          });

          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime,
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);

        this.logger.debug('Waiting before retry', {
          operation: operationName,
          attempt,
          delay,
          nextAttempt: attempt + 1,
        });

        this.metrics.incrementCounter('retry_operations_retried', {
          operation: operationName,
          attempt: attempt.toString(),
        });

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    const totalTime = Date.now() - startTime;
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: config.maxAttempts,
      totalTime,
    };
  }

  /**
   * Retry with exponential backoff
   */
  public async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryableErrors?: ErrorCode[];
      operationName?: string;
    } = {}
  ): Promise<RetryResult<T>> {
    const config: RetryConfig = {
      maxAttempts: options.maxAttempts || 3,
      backoffStrategy: 'exponential',
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      retryableErrors: options.retryableErrors || [
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.API_REQUEST_FAILED,
        ErrorCode.CONNECTION_LOST,
      ],
    };

    return this.executeWithRetry(
      operation,
      config,
      options.operationName || 'exponential_backoff_operation'
    );
  }

  /**
   * Retry with linear backoff
   */
  public async retryWithLinearBackoff<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      retryableErrors?: ErrorCode[];
      operationName?: string;
    } = {}
  ): Promise<RetryResult<T>> {
    const config: RetryConfig = {
      maxAttempts: options.maxAttempts || 3,
      backoffStrategy: 'linear',
      baseDelay: options.delay || 2000,
      maxDelay: options.delay || 2000,
      retryableErrors: options.retryableErrors || [
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.API_REQUEST_FAILED,
        ErrorCode.CONNECTION_LOST,
      ],
    };

    return this.executeWithRetry(
      operation,
      config,
      options.operationName || 'linear_backoff_operation'
    );
  }

  /**
   * Quick retry for fast operations
   */
  public async quickRetry<T>(
    operation: () => Promise<T>,
    attempts: number = 2,
    operationName: string = 'quick_retry_operation'
  ): Promise<RetryResult<T>> {
    const config: RetryConfig = {
      maxAttempts: attempts,
      backoffStrategy: 'linear',
      baseDelay: 100,
      maxDelay: 100,
      retryableErrors: [
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.API_REQUEST_FAILED,
        ErrorCode.GEOMETRY_COMPUTATION_FAILED,
        ErrorCode.WASM_EXECUTION_ERROR,
      ],
    };

    return this.executeWithRetry(operation, config, operationName);
  }

  /**
   * Retry specifically for WASM operations
   */
  public async retryWasmOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'wasm_operation'
  ): Promise<RetryResult<T>> {
    const config: RetryConfig = {
      maxAttempts: 2, // WASM errors are usually not transient
      backoffStrategy: 'linear',
      baseDelay: 500,
      maxDelay: 500,
      retryableErrors: [ErrorCode.WASM_EXECUTION_ERROR, ErrorCode.GEOMETRY_COMPUTATION_FAILED],
    };

    return this.executeWithRetry(operation, config, operationName);
  }

  /**
   * Retry for network operations
   */
  public async retryNetworkOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'network_operation'
  ): Promise<RetryResult<T>> {
    const config: RetryConfig = {
      maxAttempts: 5,
      backoffStrategy: 'exponential',
      baseDelay: 1000,
      maxDelay: 16000,
      retryableErrors: [
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.API_REQUEST_FAILED,
        ErrorCode.CONNECTION_LOST,
      ],
    };

    return this.executeWithRetry(operation, config, operationName);
  }

  /**
   * Check if error is retryable based on config
   */
  private isRetryableError(error: Error, config: RetryConfig): boolean {
    // Check if error message contains indicators of retryable errors
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    // Network-related errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('cors')
    ) {
      return (
        config.retryableErrors.includes(ErrorCode.NETWORK_TIMEOUT) ||
        config.retryableErrors.includes(ErrorCode.API_REQUEST_FAILED) ||
        config.retryableErrors.includes(ErrorCode.CONNECTION_LOST)
      );
    }

    // WASM-related errors
    if (
      errorMessage.includes('wasm') ||
      errorMessage.includes('webassembly') ||
      errorStack.includes('wasm')
    ) {
      return config.retryableErrors.includes(ErrorCode.WASM_EXECUTION_ERROR);
    }

    // Geometry computation errors
    if (
      errorMessage.includes('geometry') ||
      errorMessage.includes('computation') ||
      errorMessage.includes('opencascade')
    ) {
      return config.retryableErrors.includes(ErrorCode.GEOMETRY_COMPUTATION_FAILED);
    }

    // Default: assume non-retryable
    return false;
  }

  /**
   * Calculate delay based on backoff strategy
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    if (config.backoffStrategy === 'exponential') {
      delay = config.baseDelay * Math.pow(2, attempt - 1);
    } else {
      delay = config.baseDelay * attempt;
    }

    // Apply jitter to prevent thundering herd
    const jitter = delay * 0.1 * Math.random();
    delay = delay + jitter;

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retryable wrapper function
   */
  public createRetryableWrapper<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    config: RetryConfig,
    operationName?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const result = await this.executeWithRetry(
        () => fn(...args),
        config,
        operationName || fn.name || 'wrapped_function'
      );

      if (result.success) {
        return result.result!;
      } else {
        throw result.error!;
      }
    };
  }

  /**
   * Get retry statistics
   */
  public getRetryStats(): {
    successRate: number;
    averageAttempts: number;
    averageDuration: number;
    totalOperations: number;
  } {
    const succeeded = this.metrics.getCounter('retry_operations_succeeded');
    const failed = this.metrics.getCounter('retry_operations_failed');
    const total = succeeded + failed;

    const durationStats = this.metrics.getHistogramStats('retry_operation_duration_ms');

    return {
      successRate: total > 0 ? (succeeded / total) * 100 : 0,
      averageAttempts: 0, // Would need to track this separately
      averageDuration: durationStats.avg,
      totalOperations: total,
    };
  }
}
