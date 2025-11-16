import { describe, it, expect } from 'vitest';
import { MeshRepairSmoothMeshNode } from './smooth-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairSmoothMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      iterations: 5,
      smoothingFactor: 0.5,
      preserveVolume: true,
    } as any;

    const result = await MeshRepairSmoothMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
