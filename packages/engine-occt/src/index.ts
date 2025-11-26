export * from './worker-client';
export * from './worker-types';
export * from './integrated-geometry-api';
export * from './occt-wrapper';
// export * from './occt-loader'; // Node.js only - uses node:url for pathToFileURL
export * from './real-occt-bindings';
export * from './occt-bindings'; // WASM loader functions for testing
// Note: occt-worker.ts is not exported here - it's loaded as a Web Worker
// export * from './production-worker'; // Worker only - don't export in main thread
// export * from './production-api'; // Node.js only - uses node:path and node:url
export { ProductionLogger } from './production-logger'; // Browser-safe logger with fallbacks
export type { LogLevel, LogEntry } from './production-logger';
export * from './geometry-validator';
// export * from './node-adapter'; // Node.js only - imports GeometryAPIFactory from engine-core
// export * from './occt-operation-router'; // Node.js only - imports GeometryAPIFactory from engine-core
export * from './production-safety'; // CRITICAL: Production safety utilities

// Re-export WorkerAPI type from types package
export type { WorkerAPI } from '@brepflow/types';

// Default export is the new IntegratedGeometryAPI
export {
  IntegratedGeometryAPI as default,
  getGeometryAPI,
  createGeometryAPI,
  DEFAULT_API_CONFIG,
} from './integrated-geometry-api';

// Legacy exports for backward compatibility
export { GeometryAPI } from './geometry-api';

// GeomCore adapter for gradual migration to @madfam/geom-core
export {
  GeomCoreAdapter,
  getGeomCoreAdapter,
  createGeomCoreAdapter,
  shutdownGlobalAdapter,
  OPERATION_MAP,
  DEFAULT_ADAPTER_CONFIG,
  type GeomCoreAdapterConfig,
  type Sim4dOperationResult,
} from './geom-core-adapter';

// GeomCore worker bridge for Web Worker usage
export {
  GeomCoreWorkerHandler,
  GeomCoreWorkerClient,
  GeomCoreWorkerPool,
  setupGeomCoreWorker,
  getGeomCoreWorkerPool,
  createGeomCoreWorkerPool,
  shutdownGlobalPool,
  DEFAULT_BRIDGE_CONFIG,
  type WorkerBridgeConfig,
} from './geom-core-worker-bridge';

// Hybrid API for gradual migration with A/B testing support
export {
  HybridGeometryAPI,
  getHybridGeometryAPI,
  createHybridGeometryAPI,
  shutdownGlobalHybridAPI,
  DEFAULT_HYBRID_CONFIG,
  type HybridAPIConfig,
  type BackendPreference,
} from './hybrid-geometry-api';
