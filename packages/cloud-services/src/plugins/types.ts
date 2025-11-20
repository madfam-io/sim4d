/**
 * Plugin Manager Types
 * Type definitions for plugin system
 */

import {
  PluginId,
  UserId,
  Plugin,
  PluginPermissions,
  PluginBundle,
  Ed25519Signature,
} from '@brepflow/cloud-api/src/types';

/**
 * Plugin execution context
 * Provides runtime context for plugin execution including permissions and sandbox
 */
export interface PluginExecutionContext {
  pluginId: PluginId;
  userId: UserId;
  projectId?: string;
  nodeId?: string;
  sessionId?: string;
  capabilities: Map<string, PluginCapability>;
  sandbox: PluginSandbox;
}

/**
 * Plugin capability definition
 * Defines a capability that can be exposed to plugins
 */
export interface PluginCapability {
  name: string;
  version: string;
  permissions: string[];
  handler: (context: PluginExecutionContext, ...args: unknown[]) => any;
}

/**
 * Plugin sandbox configuration
 * Defines resource limits and isolation for plugin execution
 */
export interface PluginSandbox {
  workerId: string;
  memoryLimit: number;
  networkAllowlist: string[];
  storageQuota: number;
  timeoutMs: number;
  isolated: boolean;
}

/**
 * Plugin installation options
 */
export interface PluginInstallOptions {
  version?: string;
  source: 'marketplace' | 'local' | 'url';
  verify: boolean;
  permissions?: Partial<PluginPermissions>;
}

/**
 * Plugin execution result
 * Contains the result of a plugin execution along with logs and metrics
 */
export interface PluginExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  logs: PluginLogEntry[];
  metrics: PluginMetrics;
}

/**
 * Plugin log entry
 */
export interface PluginLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Plugin execution metrics
 */
export interface PluginMetrics {
  executionTime: number;
  memoryUsed: number;
  networkRequests: number;
  storageUsed: number;
  errors: number;
}

/**
 * Plugin backup data
 * Used for rollback during failed updates
 */
export interface PluginBackup {
  timestamp: number;
  plugin: Plugin;
  storage: Record<string, string>;
}

/**
 * Plugin execution task (internal)
 * Represents a queued plugin execution task
 */
export interface PluginExecutionTask {
  id: string;
  pluginId: PluginId;
  functionName: string;
  args: unknown[];
  context: PluginExecutionContext;
  createdAt: number;
  resolve?: (result: PluginExecutionResult) => void;
  reject?: (error: Error) => void;
}

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  engineVersion: string;
  defaultTimeout: number;
  maxConcurrentExecutions: number;
  sandboxMemoryLimit: number;
  allowUnsignedPlugins: boolean;
}
