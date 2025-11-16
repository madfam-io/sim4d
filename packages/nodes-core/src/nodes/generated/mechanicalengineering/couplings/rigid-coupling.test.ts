import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringCouplingsRigidCouplingNode } from './rigid-coupling.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringCouplingsRigidCouplingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      shaft1Diameter: 20,
      shaft2Diameter: 20,
      couplingDiameter: 40,
      length: 50,
    } as any;

    const result = await MechanicalEngineeringCouplingsRigidCouplingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
