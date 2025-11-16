import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsRollerBearingNode } from './roller-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsRollerBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerDiameter: 25,
      outerDiameter: 52,
      width: 15,
      rollerType: 'cylindrical',
    } as any;

    const result = await MechanicalEngineeringBearingsRollerBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
