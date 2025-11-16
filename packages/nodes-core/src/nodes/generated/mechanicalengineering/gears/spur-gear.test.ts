import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsSpurGearNode } from './spur-gear.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsSpurGearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      module: 2,
      teeth: 20,
      pressureAngle: 20,
      width: 20,
      hubDiameter: 20,
    } as any;

    const result = await MechanicalEngineeringGearsSpurGearNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
