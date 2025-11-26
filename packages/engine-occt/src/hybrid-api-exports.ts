/**
 * Hybrid API type exports
 * This file provides explicit type re-exports to ensure DTS generation
 */

// Re-export everything from hybrid-geometry-api with explicit declarations
export {
  HybridGeometryAPI,
  getHybridGeometryAPI,
  createHybridGeometryAPI,
  shutdownGlobalHybridAPI,
  DEFAULT_HYBRID_CONFIG,
} from './hybrid-geometry-api';

export type {
  HybridAPIConfig,
  BackendPreference,
} from './hybrid-geometry-api';
