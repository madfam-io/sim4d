import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsFlangeBearingNode } from './flange-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsFlangeBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      boreDiameter: 12,
      flangeDiameter: 40,
      thickness: 8,
      mountingHoles: 4,
    } as any;

    const result = await MechanicalEngineeringBearingsFlangeBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
