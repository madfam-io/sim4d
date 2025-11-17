/**
 * Global logger instance for BrepFlow Studio
 *
 * This module provides a centralized logger instance that can be imported
 * throughout the application for consistent structured logging.
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logging/logger-instance';
 *
 * logger.info('User action', { action: 'nodeAdded', nodeType: 'Box' });
 * logger.error('API call failed', { endpoint: '/api/graphs', error });
 * logger.debug('State update', { previous, current });
 * ```
 */

import { Logger } from './logger';
import { MonitoringConfig } from '../error-handling/types';

/**
 * Default logging configuration
 * Can be overridden via environment variables or runtime configuration
 */
const DEFAULT_LOGGING_CONFIG: MonitoringConfig['logging'] = {
  enabled: true,
  level: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  console: true,
  structured: import.meta.env.PROD ? false : true, // Structured logs in dev, simple in prod
  remote: import.meta.env.VITE_REMOTE_LOGGING === 'true',
};

/**
 * Generate a session ID for this browser session
 * Uses sessionStorage to persist across page reloads within the same session
 */
function getOrCreateSessionId(): string {
  const SESSION_KEY = 'brepflow_session_id';

  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Global logger instance
 * Initialized with default configuration
 */
export const logger = Logger.getInstance(DEFAULT_LOGGING_CONFIG, getOrCreateSessionId());

/**
 * Create a child logger with specific context
 * Useful for module-specific or feature-specific logging
 *
 * @example
 * const graphLogger = createChildLogger({ module: 'graph-store' });
 * graphLogger.info('Node added', { nodeId });
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.createChild(context);
}

/**
 * Performance timing helper
 *
 * @example
 * const timing = startTiming('graph-evaluation');
 * // ... perform operation
 * timing.finish({ nodeCount: 42 });
 */
export function startTiming(operation: string, context: Record<string, any> = {}) {
  return new (class {
    private startTime = performance.now();

    finish(additionalContext?: Record<string, any>): void {
      const duration = performance.now() - this.startTime;
      logger.info(`Completed: ${operation}`, {
        duration_ms: duration.toFixed(2),
        ...context,
        ...additionalContext,
      });
    }

    error(error: Error, additionalContext?: Record<string, any>): void {
      const duration = performance.now() - this.startTime;
      logger.error(`Failed: ${operation}`, {
        duration_ms: duration.toFixed(2),
        error: error.message,
        stack: error.stack,
        ...context,
        ...additionalContext,
      });
    }
  })();
}

/**
 * Reconfigure the logger at runtime
 * Useful for dynamic log level changes
 */
export function reconfigureLogger(config: Partial<MonitoringConfig['logging']>): void {
  // Note: This requires extending the Logger class to support runtime reconfiguration
  // For now, this is a placeholder for future implementation
  console.warn('Logger reconfiguration not yet implemented. Restart required for config changes.');
}

/**
 * Export the Logger class for type definitions
 */
export { Logger } from './logger';
export type { LogEntry, LogLevel } from './logger';
