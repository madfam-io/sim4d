/**
 * Studio Geometry API Service
 * Wraps the geometry API factory for Studio-specific use
 */

import { getGeometryAPI as getGeometryAPIBase, IntegratedGeometryAPI } from '@brepflow/engine-occt';
// WorkerAPI type imported for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { WorkerAPI } from '@brepflow/types';

let apiInstance: IntegratedGeometryAPI | null = null;
let initializationPromise: Promise<IntegratedGeometryAPI> | null = null;

/**
 * Get geometry API instance for Studio (always real OCCT)
 */
export async function getGeometryAPI(): Promise<IntegratedGeometryAPI> {
  if (apiInstance) {
    return apiInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = Promise.resolve(
    getGeometryAPIBase({
      enableRealOCCT: true,
      maxRetries: 2,
    })
  )
    .then((api) => {
      apiInstance = api;
      return api;
    })
    .finally(() => {
      initializationPromise = null;
    });

  return initializationPromise;
}

/**
 * Reset geometry API (useful for error recovery)
 */
export function resetGeometryAPI(): void {
  apiInstance = null;
  initializationPromise = null;
  // IntegratedGeometryAPI doesn't have a static reset method
  // Just clear our local references
}

/**
 * Get API status for UI feedback
 */
export function getAPIStatus() {
  if (!apiInstance) {
    return { initialized: false, usingRealOCCT: false };
  }
  return {
    initialized: apiInstance.isInitialized,
    usingRealOCCT: true,
  };
}

/**
 * Check if real geometry is available
 */
export function isRealGeometryAvailable() {
  // IntegratedGeometryAPI always aims for real OCCT
  return true;
}
