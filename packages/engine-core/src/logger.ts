/**
 * Lightweight structured logger for BrepFlow packages
 * Production-ready with log levels, context, and filtering
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  enableColors?: boolean;
  enableTimestamps?: boolean;
}

class BrepFlowLogger {
  private static instance: BrepFlowLogger;
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enableColors: true,
    enableTimestamps: true,
  };

  private constructor() {
    // Initialize from environment if available
    if (typeof process !== 'undefined' && process.env) {
      const envLevel = process.env.BREPFLOW_LOG_LEVEL;
      if (envLevel) {
        this.setLevel(this.parseLogLevel(envLevel));
      }
    }
  }

  public static getInstance(): BrepFlowLogger {
    if (!BrepFlowLogger.instance) {
      BrepFlowLogger.instance = new BrepFlowLogger();
    }
    return BrepFlowLogger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error
      ? {
          ...context,
          error: error.message,
          stack: error.stack,
        }
      : {
          ...context,
          error: String(error),
        };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (level < this.config.level) {
      return;
    }

    const timestamp = this.config.enableTimestamps
      ? `[${new Date().toISOString()}]`
      : '';
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const levelStr = this.formatLevel(level);

    // Sanitize message to prevent log injection attacks
    // Remove control characters and limit line breaks
    const sanitizedMessage = message
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
      .replace(/[\r\n]+/g, ' '); // Replace newlines with spaces

    const formattedMessage = `${timestamp}${prefix}${levelStr} ${sanitizedMessage}`;

    const consoleMethod = this.getConsoleMethod(level);

    // Avoid format strings with user-controlled data to prevent log injection
    // Pass sanitized strings directly to console methods
    if (context && Object.keys(context).length > 0) {
      try {
        const contextStr = JSON.stringify(context, null, 2);
        consoleMethod(formattedMessage, contextStr);
      } catch {
        // Fallback if JSON.stringify fails (e.g., circular references)
        consoleMethod(formattedMessage, '[Context serialization failed]');
      }
    } else {
      consoleMethod(formattedMessage);
    }
  }

  private formatLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';

    const labels = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    };

    const label = labels[level] || 'UNKNOWN';

    if (this.config.enableColors && colors[level]) {
      return `[${colors[level]}${label}${reset}]`;
    }

    return `[${label}]`;
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug.bind(console);
      case LogLevel.INFO:
        return console.info.bind(console);
      case LogLevel.WARN:
        return console.warn.bind(console);
      case LogLevel.ERROR:
        return console.error.bind(console);
      default:
        return console.log.bind(console);
    }
  }

  private parseLogLevel(level: string): LogLevel {
    const normalized = level.toUpperCase();
    switch (normalized) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
      case 'WARNING':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'SILENT':
      case 'NONE':
        return LogLevel.SILENT;
      default:
        return LogLevel.INFO;
    }
  }

  public createChild(prefix: string, context?: LogContext): ChildLogger {
    return new ChildLogger(this, prefix, context);
  }
}

/**
 * Child logger with persistent context
 */
export class ChildLogger {
  constructor(
    private parent: BrepFlowLogger,
    private prefix: string,
    private baseContext?: LogContext
  ) {}

  public debug(message: string, context?: LogContext): void {
    this.parent.debug(
      `[${this.prefix}] ${message}`,
      { ...this.baseContext, ...context }
    );
  }

  public info(message: string, context?: LogContext): void {
    this.parent.info(
      `[${this.prefix}] ${message}`,
      { ...this.baseContext, ...context }
    );
  }

  public warn(message: string, context?: LogContext): void {
    this.parent.warn(
      `[${this.prefix}] ${message}`,
      { ...this.baseContext, ...context }
    );
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.parent.error(
      `[${this.prefix}] ${message}`,
      error,
      { ...this.baseContext, ...context }
    );
  }
}

// Export singleton instance
export const logger = BrepFlowLogger.getInstance();

// Export convenience function for creating child loggers
export function createLogger(prefix: string, context?: LogContext): ChildLogger {
  return logger.createChild(prefix, context);
}
