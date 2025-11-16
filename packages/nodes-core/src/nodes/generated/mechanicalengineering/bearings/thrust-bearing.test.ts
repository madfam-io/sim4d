import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsThrustBearingNode } from './thrust-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsThrustBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerDiameter: 20,
      outerDiameter: 40,
      height: 10,
      type: 'ball',
    } as any;

    const result = await MechanicalEngineeringBearingsThrustBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
