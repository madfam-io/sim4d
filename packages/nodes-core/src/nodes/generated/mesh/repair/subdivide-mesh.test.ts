import { describe, it, expect } from 'vitest';
import { MeshRepairSubdivideMeshNode } from './subdivide-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairSubdivideMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      subdivisionType: 'loop',
      levels: 1,
    } as any;

    const result = await MeshRepairSubdivideMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
