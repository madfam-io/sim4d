import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringGearsTimingPulleyNode } from './timing-pulley.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringGearsTimingPulleyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      pitch: 'GT2',
      teeth: 20,
      width: 10,
      flanges: true,
    } as any;

    const result = await MechanicalEngineeringGearsTimingPulleyNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
