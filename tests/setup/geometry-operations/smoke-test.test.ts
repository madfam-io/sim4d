/**
 * Smoke Test Suite
 * Quick verification that the geometry test infrastructure works
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@brepflow/engine-occt';
import { setupWASMTestEnvironment } from '../wasm-test-setup';

describe('Geometry Operations Smoke Test', () => {
  let geometryAPI: GeometryAPI;
  let cleanup: () => void;

  beforeEach(async () => {
    const { cleanup: cleanupFn } = await setupWASMTestEnvironment();
    cleanup = cleanupFn;
    geometryAPI = new GeometryAPI();
  });

  afterEach(() => {
    cleanup();
  });

  it('should initialize geometry API successfully', async () => {
    await geometryAPI.init();
    expect(geometryAPI).toBeDefined();
  });

  it('should create a simple box', async () => {
    await geometryAPI.init();

    const box = await geometryAPI.invoke('MAKE_BOX', {
      width: 100,
      height: 50,
      depth: 25,
    });

    expect(box).toBeDefined();
    expect(box.id).toBeDefined();
    expect(box.type).toBe('solid');
    expect(box.bbox).toBeDefined();
    expect(box.bbox.max.x - box.bbox.min.x).toBeCloseTo(100);
    expect(box.bbox.max.y - box.bbox.min.y).toBeCloseTo(50);
    expect(box.bbox.max.z - box.bbox.min.z).toBeCloseTo(25);
  });

  it('should handle sphere creation', async () => {
    await geometryAPI.init();

    const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
      radius: 25,
    });

    expect(sphere).toBeDefined();
    expect(sphere.id).toBeDefined();
    expect(sphere.type).toBe('solid');
    expect(sphere.bbox).toBeDefined();
  });

  it('should handle tessellation', async () => {
    await geometryAPI.init();

    const box = await geometryAPI.invoke('MAKE_BOX', {
      width: 50,
      height: 50,
      depth: 50,
    });

    const { mesh } = await geometryAPI.invoke('TESSELLATE', {
      shape: box,
      tolerance: 0.1,
    });

    expect(mesh).toBeDefined();
    expect(mesh.positions).toBeInstanceOf(Float32Array);
    expect(mesh.normals).toBeInstanceOf(Float32Array);
    expect(mesh.indices).toBeInstanceOf(Uint32Array);
    expect(mesh.positions.length).toBeGreaterThan(0);
  });
});
