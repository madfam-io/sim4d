/**
 * Structured logging system for BrepFlow Studio
 */

import { MonitoringConfig } from '../error-handling/types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: number;
  sessionId: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private static instance: Logger | null = null;
  private config: MonitoringConfig['logging'];
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private readonly BUFFER_FLUSH_INTERVAL = 10000; // 10 seconds
  private readonly MAX_BUFFER_SIZE = 500;
  private flushInterval: number | null = null;

  private constructor(config: MonitoringConfig['logging'], sessionId: string) {
    this.config = config;
    this.sessionId = sessionId;

    if (config.remote) {
      this.startBuffering();
    }
  }

  public static getInstance(config?: MonitoringConfig['logging'], sessionId?: string): Logger {
    if (!Logger.instance) {
      if (!config || !sessionId) {
        throw new Error('Logger must be initialized with config and sessionId on first use');
      }
      Logger.instance = new Logger(config, sessionId);
    }
    return Logger.instance;
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log error message
   */
  public error(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: Record<string, unknown>
  ): void {
    // Check if we should log this level
    const configLevel = this.getLogLevelFromConfig();
    if (level < configLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      context,
    };

    // Console logging
    if (this.config.console) {
      this.logToConsole(entry);
    }

    // Remote logging (buffered)
    if (this.config.remote) {
      this.addToBuffer(entry);
    }
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}]`;

    if (this.config.structured) {
      // Structured console output
      const structured = {
        timestamp: entry.timestamp,
        level: LogLevel[entry.level],
        message: entry.message,
        sessionId: entry.sessionId,
        ...(entry.data && { data: entry.data }),
        ...(entry.context && { context: entry.context }),
      };

      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(prefix, structured);
          break;
        case LogLevel.INFO:
          console.info(prefix, structured);
          break;
        case LogLevel.WARN:
          console.warn(prefix, structured);
          break;
        case LogLevel.ERROR:
          console.error(prefix, structured);
          break;
      }
    } else {
      // Simple console output
      const message = `${prefix} ${entry.message}`;
      const logData = entry.data ? [entry.data] : [];

      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(message, ...logData);
          break;
        case LogLevel.INFO:
          console.info(message, ...logData);
          break;
        case LogLevel.WARN:
          console.warn(message, ...logData);
          break;
        case LogLevel.ERROR:
          console.error(message, ...logData);
          break;
      }
    }
  }

  /**
   * Add log entry to buffer for remote logging
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Flush buffer if it gets too large
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }
  }

  /**
   * Start buffering system for remote logging
   */
  private startBuffering(): void {
    this.flushInterval = window.setInterval(() => {
      this.flushBuffer();
    }, this.BUFFER_FLUSH_INTERVAL);
  }

  /**
   * Flush log buffer to remote service
   */
  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Here you would send logs to your remote logging service
      // Example: Elasticsearch, Datadog, CloudWatch, etc.

      // For now, just log that we would send them
      if (this.config.console && this.getLogLevelFromConfig() <= LogLevel.DEBUG) {
        console.debug(`[Logger] Would flush ${logsToFlush.length} log entries to remote service`);
      }

      // Example implementation for a generic logging endpoint:
      /*
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToFlush,
          source: 'brepflow-studio'
        })
      });
      */
    } catch (error) {
      // If remote logging fails, log to console
      if (this.config.console) {
        console.error('[Logger] Failed to flush logs to remote service:', error);
      }

      // Re-add failed logs to buffer (up to a limit)
      if (this.logBuffer.length < this.MAX_BUFFER_SIZE) {
        this.logBuffer.unshift(
          ...logsToFlush.slice(0, this.MAX_BUFFER_SIZE - this.logBuffer.length)
        );
      }
    }
  }

  /**
   * Get current log buffer (for debugging)
   */
  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  public clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Stop logger and flush remaining logs
   */
  public async stop(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush any remaining logs
    await this.flushBuffer();
  }

  /**
   * Create child logger with additional context
   */
  public createChild(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Convert config level string to LogLevel enum
   */
  private getLogLevelFromConfig(): LogLevel {
    switch (this.config.level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }
}

/**
 * Child logger that adds context to all log messages
 */
export class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, unknown>
  ) {}

  public debug(message: string, data?: unknown, additionalContext?: Record<string, unknown>): void {
    this.parent.debug(message, data, { ...this.context, ...additionalContext });
  }

  public info(message: string, data?: unknown, additionalContext?: Record<string, unknown>): void {
    this.parent.info(message, data, { ...this.context, ...additionalContext });
  }

  public warn(message: string, data?: unknown, additionalContext?: Record<string, unknown>): void {
    this.parent.warn(message, data, { ...this.context, ...additionalContext });
  }

  public error(message: string, data?: unknown, additionalContext?: Record<string, unknown>): void {
    this.parent.error(message, data, { ...this.context, ...additionalContext });
  }
}

/**
 * Performance timing logger
 */
export class TimingLogger {
  private startTime: number;
  private logger: Logger;
  private operation: string;
  private context: Record<string, unknown>;

  constructor(logger: Logger, operation: string, context: Record<string, unknown> = {}) {
    this.logger = logger;
    this.operation = operation;
    this.context = context;
    this.startTime = performance.now();

    this.logger.debug(`Starting operation: ${operation}`, null, context);
  }

  public finish(additionalContext?: Record<string, unknown>): void {
    const duration = performance.now() - this.startTime;
    const finalContext = {
      ...this.context,
      ...additionalContext,
      duration_ms: duration,
    };

    this.logger.info(`Completed operation: ${this.operation}`, null, finalContext);
  }

  public error(error: Error, additionalContext?: Record<string, unknown>): void {
    const duration = performance.now() - this.startTime;
    const finalContext = {
      ...this.context,
      ...additionalContext,
      duration_ms: duration,
      error: error.message,
      stack: error.stack,
    };

    this.logger.error(`Failed operation: ${this.operation}`, null, finalContext);
  }
}
