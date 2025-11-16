import { describe, it, expect } from 'vitest';
import { MeshTessellationQuadMeshNode } from './quad-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshTessellationQuadMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      targetQuadSize: 5,
      quadDominance: 0.8,
    } as any;

    const result = await MeshTessellationQuadMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
