import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringCouplingsFluidCouplingNode } from './fluid-coupling.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringCouplingsFluidCouplingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      impellerDiameter: 150,
      housingDiameter: 180,
      vaneCount: 32,
      fluidCapacity: 2,
    } as any;

    const result = await MechanicalEngineeringCouplingsFluidCouplingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
