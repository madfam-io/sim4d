export * from './dag-engine';
export * from './graph-manager';
export * from './node-registry';
export * from './cache';
export * from './hash';
export * from './config/environment';
// NOTE: geometry-api-factory NOT exported (Node.js only - uses node:path and node:url)
// Server-side consumers (CLI, collaboration server) should import directly from './geometry-api-factory'
export * from './constraints';
export * from './errors';
export * from './diagnostics/evaluation-profiler';
export * from './performance-monitor';
export {
  PerformanceReporter,
  ConsolePerformanceExporter,
  JSONPerformanceExporter,
  type PerformanceReport,
  type PerformanceAggregates,
  type ThresholdViolation,
  type PerformanceExporter,
} from './performance-reporter';
export { logger, createLogger, LogLevel, type LogContext, type ChildLogger } from './logger';

// Collaboration types and interfaces
// NOTE: Collaboration exports temporarily disabled due to DTS build issues.
// The collaboration-engine.ts file has @ts-nocheck and type branding issues
// that prevent successful TypeScript declaration generation.
// Requires: Fix branded type usage and remove @ts-nocheck from collaboration files.
// export * from './collaboration/types';
// export { BrepFlowCollaborationEngine } from './collaboration/collaboration-engine';
// export { OperationalTransformEngine } from './collaboration/operational-transform';
// export { ParameterSynchronizer, ParameterSyncManager } from './collaboration/parameter-sync';
// export { CollaborationWebSocketClient } from './collaboration/websocket-client';

// Scripting types and interfaces
// NOTE: Scripting exports temporarily disabled due to DTS build issues.
// The script-engine.ts file has @ts-nocheck and needs type cleanup.
// Requires: Fix type issues and remove @ts-nocheck from scripting files.
// export * from './scripting/types';
// export { BrepFlowScriptEngine } from './scripting/script-engine';
// export * from './scripting/javascript-executor';
