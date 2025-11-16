import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsAirBearingNode } from './air-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsAirBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      diameter: 50,
      thickness: 10,
      pocketCount: 6,
      restrictorType: 'orifice',
    } as any;

    const result = await MechanicalEngineeringBearingsAirBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
