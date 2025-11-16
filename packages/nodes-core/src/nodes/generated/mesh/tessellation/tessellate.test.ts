import { describe, it, expect } from 'vitest';
import { MeshTessellationTessellateNode } from './tessellate.node';
import { createTestContext } from '../test-utils';

describe('MeshTessellationTessellateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      linearDeflection: 0.1,
      angularDeflection: 0.5,
      relative: false,
      qualityNormals: true,
    } as any;

    const result = await MeshTessellationTessellateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
