import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryVoxelGridNode } from './voxel-grid.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryVoxelGridNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      voxelSize: 1,
      fillInterior: true,
      optimize: true,
    } as any;

    const result = await AlgorithmicGeometryVoxelGridNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
