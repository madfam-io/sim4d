import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsRackGearNode } from './rack-gear.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsRackGearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      module: 2,
      length: 100,
      width: 20,
      height: 15,
    } as any;

    const result = await MechanicalEngineeringGearsRackGearNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
