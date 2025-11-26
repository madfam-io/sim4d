/**
 * Lightweight structured logger for Sim4D packages
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

class Sim4DLogger {
  private static instance: Sim4DLogger;
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enableColors: true,
    enableTimestamps: true,
  };

  private constructor() {
    // Initialize from environment if available
    if (typeof process !== 'undefined' && process.env) {
      const envLevel = process.env.SIM4D_LOG_LEVEL;
      if (envLevel) {
        this.setLevel(this.parseLogLevel(envLevel));
      }
    }
  }

  public static getInstance(): Sim4DLogger {
    if (!Sim4DLogger.instance) {
      Sim4DLogger.instance = new Sim4DLogger();
    }
    return Sim4DLogger.instance;
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
    const errorContext =
      error instanceof Error
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

  /**
   * Sanitizes user input to prevent log injection attacks
   * Removes control characters, ANSI escape sequences, and normalizes whitespace
   * @param input - User-provided string to sanitize
   * @returns Sanitized string safe for logging
   */
  public sanitizeForLogging(input: string): string {
    return (
      input
        // Remove all control characters (0x00-0x1F, 0x7F-0x9F)
        // eslint-disable-next-line no-control-regex -- Intentional control character removal for security
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Remove ANSI escape sequences to prevent terminal manipulation
        // eslint-disable-next-line no-control-regex -- Intentional ANSI escape sequence removal for security
        .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '')
        // Normalize line breaks to prevent log entry forgery
        .replace(/[\r\n]+/g, ' ')
        // Remove zero-width and other invisible Unicode characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Limit consecutive spaces
        .replace(/\s{2,}/g, ' ')
        // Trim to prevent padding attacks
        .trim()
    );
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (level < this.config.level) {
      return;
    }

    const timestamp = this.config.enableTimestamps ? `[${new Date().toISOString()}]` : '';
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const levelStr = this.formatLevel(level);

    // Sanitize user-provided message to prevent log injection attacks
    const sanitizedMessage = this.sanitizeForLogging(message);

    // Separate static log prefix from user-controlled message to prevent log injection
    const logPrefix = `${timestamp}${prefix}${levelStr}`;

    const consoleMethod = this.getConsoleMethod(level);

    // Avoid format strings with user-controlled data to prevent log injection
    // Pass prefix and sanitized message as separate arguments
    if (context && Object.keys(context).length > 0) {
      try {
        // Create a sanitized copy of context to prevent injection via object values
        const sanitizedContext: LogContext = {};
        for (const [key, value] of Object.entries(context)) {
          // Sanitize keys to prevent injection via property names
          const safeKey = this.sanitizeForLogging(key);
          // Sanitize values based on type
          if (typeof value === 'string') {
            sanitizedContext[safeKey] = this.sanitizeForLogging(value);
          } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
            // Primitive types are safe
            sanitizedContext[safeKey] = value;
          } else {
            // For objects/arrays, convert to string and sanitize
            sanitizedContext[safeKey] = this.sanitizeForLogging(String(value));
          }
        }
        // Sanitize JSON output to prevent log injection via formatted output
        const contextJson = JSON.stringify(sanitizedContext, null, 2);
        const safeContextStr = this.sanitizeForLogging(contextJson);
        // Use explicit concatenation to prevent any potential format string injection
        consoleMethod(logPrefix + ' ' + sanitizedMessage + ' ' + safeContextStr);
      } catch {
        // Fallback if JSON.stringify fails (e.g., circular references)
        // Use explicit concatenation to prevent any potential format string injection
        consoleMethod(logPrefix + ' ' + sanitizedMessage + ' [Context serialization failed]');
      }
    } else {
      // Use explicit concatenation to prevent any potential format string injection
      consoleMethod(logPrefix + ' ' + sanitizedMessage);
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
    // Sanitize prefix to prevent log injection attacks via child logger prefix
    const sanitizedPrefix = this.sanitizeForLogging(prefix);
    return new ChildLogger(this, sanitizedPrefix, context);
  }
}

/**
 * Child logger with persistent context
 */
export class ChildLogger {
  constructor(
    private parent: Sim4DLogger,
    private prefix: string,
    private baseContext?: LogContext
  ) {}

  public debug(message: string, context?: LogContext): void {
    // Sanitize message before concatenation to prevent log injection
    const sanitizedMessage = this.parent.sanitizeForLogging(message);
    this.parent.debug(`[${this.prefix}] ${sanitizedMessage}`, { ...this.baseContext, ...context });
  }

  public info(message: string, context?: LogContext): void {
    // Sanitize message before concatenation to prevent log injection
    const sanitizedMessage = this.parent.sanitizeForLogging(message);
    this.parent.info(`[${this.prefix}] ${sanitizedMessage}`, { ...this.baseContext, ...context });
  }

  public warn(message: string, context?: LogContext): void {
    // Sanitize message before concatenation to prevent log injection
    const sanitizedMessage = this.parent.sanitizeForLogging(message);
    this.parent.warn(`[${this.prefix}] ${sanitizedMessage}`, { ...this.baseContext, ...context });
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    // Sanitize message before concatenation to prevent log injection
    const sanitizedMessage = this.parent.sanitizeForLogging(message);
    this.parent.error(`[${this.prefix}] ${sanitizedMessage}`, error, {
      ...this.baseContext,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = Sim4DLogger.getInstance();

// Export convenience function for creating child loggers
export function createLogger(prefix: string, context?: LogContext): ChildLogger {
  return logger.createChild(prefix, context);
}
