import { describe, it, expect } from 'vitest';
import { MeshRepairMeshOffsetNode } from './mesh-offset.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairMeshOffsetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      offsetDistance: 1,
      solidify: false,
    } as any;

    const result = await MeshRepairMeshOffsetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
