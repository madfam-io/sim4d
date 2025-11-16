import { describe, it, expect } from 'vitest';
import { MeshTessellationRemeshUniformNode } from './remesh-uniform.node';
import { createTestContext } from '../test-utils';

describe('MeshTessellationRemeshUniformNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      targetEdgeLength: 1,
      iterations: 3,
      preserveFeatures: true,
    } as any;

    const result = await MeshTessellationRemeshUniformNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
