import { describe, it, expect } from 'vitest';
import { MeshRepairSimplifyMeshNode } from './simplify-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairSimplifyMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      targetRatio: 0.5,
      preserveBoundaries: true,
      preserveTopology: false,
      maxError: 0.1,
    } as any;

    const result = await MeshRepairSimplifyMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
