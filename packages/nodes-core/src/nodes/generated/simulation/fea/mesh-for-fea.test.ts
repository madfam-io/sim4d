import { describe, it, expect } from 'vitest';
import { SimulationFEAMeshForFEANode } from './mesh-for-fea.node';
import { createTestContext } from '../test-utils';

describe('SimulationFEAMeshForFEANode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      elementType: 'auto',
      elementSize: 5,
      refinementZones: true,
      qualityTarget: 0.8,
    } as any;

    const result = await SimulationFEAMeshForFEANode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
