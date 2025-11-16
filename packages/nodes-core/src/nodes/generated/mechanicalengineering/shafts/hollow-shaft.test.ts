import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringShaftsHollowShaftNode } from './hollow-shaft.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringShaftsHollowShaftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      outerDiameter: 40,
      innerDiameter: 30,
      length: 100,
      endMachining: 'none',
    } as any;

    const result = await MechanicalEngineeringShaftsHollowShaftNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
