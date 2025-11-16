import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringFastenersWasherNode } from './washer.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringFastenersWasherNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerDiameter: 6.4,
      outerDiameter: 12,
      thickness: 1.6,
      type: 'flat',
    } as any;

    const result = await MechanicalEngineeringFastenersWasherNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
