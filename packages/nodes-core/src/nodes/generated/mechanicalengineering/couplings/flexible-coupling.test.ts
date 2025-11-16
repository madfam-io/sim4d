import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringCouplingsFlexibleCouplingNode } from './flexible-coupling.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringCouplingsFlexibleCouplingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      type: 'jaw',
      boreDiameter1: 10,
      boreDiameter2: 10,
      outerDiameter: 30,
    } as any;

    const result = await MechanicalEngineeringCouplingsFlexibleCouplingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
