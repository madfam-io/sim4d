import { describe, it, expect } from 'vitest';
import { MeshRepairDecimateMeshNode } from './decimate-mesh.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairDecimateMeshNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      targetTriangles: 1000,
      preserveFeatures: true,
      featureAngle: 30,
    } as any;

    const result = await MeshRepairDecimateMeshNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
