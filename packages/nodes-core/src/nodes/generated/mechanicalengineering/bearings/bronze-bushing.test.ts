import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsBronzeBushingNode } from './bronze-bushing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsBronzeBushingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerDiameter: 10,
      outerDiameter: 14,
      length: 15,
      oilGrooves: true,
      flanged: false,
    } as any;

    const result = await MechanicalEngineeringBearingsBronzeBushingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
