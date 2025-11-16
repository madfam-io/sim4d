import { describe, it, expect } from 'vitest';
import { MeshTessellationVoxelMeshNode } from './voxel-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshTessellationVoxelMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      voxelSize: 1,
      fillInterior: false,
    } as any;

    const result = await MeshTessellationVoxelMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
