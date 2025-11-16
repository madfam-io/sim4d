import { describe, it, expect } from 'vitest';
import { SimulationFEAMaterialAssignNode } from './material-assign.node';
import { createTestContext } from '../test-utils';

describe('SimulationFEAMaterialAssignNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      material: 'steel',
      youngsModulus: 200000,
      poissonsRatio: 0.3,
      density: 7850,
      yieldStrength: 250,
    } as any;

    const result = await SimulationFEAMaterialAssignNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
