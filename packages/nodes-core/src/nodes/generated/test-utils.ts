/**
 * Test utilities for generated node tests - REAL OCCT ONLY
 * NO MOCK GEOMETRY - All tests use real OCCT WASM
 */

import { EvaluationContext } from '@brepflow/types';
import { IntegratedGeometryAPI } from '@brepflow/engine-occt';

let geometryAPI: IntegratedGeometryAPI | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize real OCCT geometry API
 * This loads the actual WASM module - NO MOCKING
 */
async function initializeRealGeometry(): Promise<void> {
  if (geometryAPI) return; // Already initialized

  if (!initPromise) {
    initPromise = (async () => {
      try {
        geometryAPI = new IntegratedGeometryAPI();
        await geometryAPI.init();
        console.log('[test-utils] Real OCCT geometry initialized');
      } catch (error) {
        console.error('[test-utils] Failed to initialize real OCCT:', error);
        throw new Error('Real OCCT geometry required for tests - no mocks allowed');
      }
    })();
  }

  await initPromise;
}

/**
 * Create a test context with REAL OCCT geometry
 * This function requires WASM to be available - NO FALLBACK TO MOCKS
 */
export async function createTestContext(): Promise<EvaluationContext> {
  // Initialize real geometry API
  await initializeRealGeometry();

  if (!geometryAPI) {
    throw new Error('Real OCCT geometry API not available - cannot run tests');
  }

  return {
    geom: geometryAPI as unknown, // Legacy interface compatibility
    geometry: geometryAPI as unknown, // New interface
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`),
    },
    session: {
      id: 'test-session',
      timestamp: Date.now(),
    },
  };
}

/**
 * NO MOCK GEOMETRY FUNCTION
 * Use real OCCT geometry creation through the API
 */
export async function createGeometry(type: 'box' | 'sphere' | 'cylinder', params?: any) {
  await initializeRealGeometry();

  if (!geometryAPI) {
    throw new Error('Real OCCT geometry required - no mocks');
  }

  switch (type) {
    case 'box':
      return await geometryAPI.invoke('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 100,
        height: 100,
        depth: 100,
        ...params,
      });
    case 'sphere':
      return await geometryAPI.invoke('MAKE_SPHERE', {
        center: { x: 0, y: 0, z: 0 },
        radius: 50,
        ...params,
      });
    case 'cylinder':
      return await geometryAPI.invoke('MAKE_CYLINDER', {
        center: { x: 0, y: 0, z: 0 },
        axis: { x: 0, y: 0, z: 1 },
        radius: 50,
        height: 100,
        ...params,
      });
    default:
      throw new Error(`Unsupported geometry type: ${type}`);
  }
}

/**
 * Check if real OCCT is available
 */
export function isRealGeometryAvailable(): boolean {
  return geometryAPI !== null;
}

/**
 * Skip test if real OCCT is not available
 */
export function skipIfNoRealGeometry() {
  if (!geometryAPI) {
    console.warn('Skipping test - real OCCT geometry required');
    return true;
  }
  return false;
}
