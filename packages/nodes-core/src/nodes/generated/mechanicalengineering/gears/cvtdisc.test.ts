import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsCVTDiscNode } from './cvtdisc.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsCVTDiscNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      minDiameter: 30,
      maxDiameter: 100,
      coneAngle: 11,
      shaftDiameter: 20,
    } as any;

    const result = await MechanicalEngineeringGearsCVTDiscNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
