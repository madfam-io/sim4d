import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringCouplingsOldhamCouplingNode } from './oldham-coupling.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringCouplingsOldhamCouplingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      hubDiameter: 40,
      discDiameter: 35,
      slotWidth: 8,
      totalLength: 40,
    } as any;

    const result = await MechanicalEngineeringCouplingsOldhamCouplingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
