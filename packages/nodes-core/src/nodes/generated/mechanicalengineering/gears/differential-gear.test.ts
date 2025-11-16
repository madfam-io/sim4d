import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsDifferentialGearNode } from './differential-gear.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsDifferentialGearNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      housingCenter: undefined,
    } as any;
    const params = {
      ringGearTeeth: 41,
      pinionTeeth: 13,
      spiderGearTeeth: 10,
      module: 3,
    } as any;

    const result = await MechanicalEngineeringGearsDifferentialGearNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
