import { describe, it, expect } from 'vitest';
import { SimulationFEAApplyLoadsNode } from './apply-loads.node';
import { createTestContext } from '../test-utils';

describe('SimulationFEAApplyLoadsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
      applicationFaces: undefined,
    } as any;
    const params = {
      loadType: 'force',
      magnitude: 1000,
      direction: [0, 0, -1],
      units: 'N',
    } as any;

    const result = await SimulationFEAApplyLoadsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
