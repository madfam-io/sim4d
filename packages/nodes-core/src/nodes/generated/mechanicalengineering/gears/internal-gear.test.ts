import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsInternalGearNode } from './internal-gear.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsInternalGearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      module: 2,
      teeth: 60,
      rimThickness: 10,
      width: 20,
    } as any;

    const result = await MechanicalEngineeringGearsInternalGearNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
