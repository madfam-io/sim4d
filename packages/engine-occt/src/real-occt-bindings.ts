/**
 * Real OCCT.wasm bindings implementation
 *
 * This file now serves as a re-export facade for the refactored modular implementation.
 * The actual implementation has been split into focused modules in ./bindings/
 *
 * Backward compatibility: All existing imports from this file will continue to work.
 */

// Re-export the refactored RealOCCT class and types
export { RealOCCT } from './bindings/index';
export type {
  OCCTShape,
  OCCTVec3,
  OCCTHandle,
  OCCTBuilder,
  OCCTBoolean,
  OCCTFillet,
  OCCTMesh,
  OCCTBounds,
  PatternResult,
} from './bindings/types';
