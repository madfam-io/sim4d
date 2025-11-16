import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsBallBearingNode } from './ball-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsBallBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerDiameter: 20,
      outerDiameter: 47,
      width: 14,
      ballCount: 8,
      showCage: true,
    } as any;

    const result = await MechanicalEngineeringBearingsBallBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
