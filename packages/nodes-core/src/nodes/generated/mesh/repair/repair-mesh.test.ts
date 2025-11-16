import { describe, it, expect } from 'vitest';
import { MeshRepairRepairMeshNode } from './repair-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairRepairMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      fillHoles: true,
      fixNormals: true,
      removeDegenerate: true,
      removeDuplicates: true,
      makeManifold: false,
    } as any;

    const result = await MeshRepairRepairMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
