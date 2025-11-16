import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsBevelGearNode } from './bevel-gear.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsBevelGearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      apex: undefined,
    } as any;
    const params = {
      module: 3,
      teeth: 25,
      coneAngle: 45,
      faceWidth: 15,
    } as any;

    const result = await MechanicalEngineeringGearsBevelGearNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
