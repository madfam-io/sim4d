import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringMechanismsClutchMechanismNode } from './clutch-mechanism.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringMechanismsClutchMechanismNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      type: 'friction',
      outerDiameter: 100,
      innerDiameter: 50,
      plateCount: 3,
    } as any;

    const result = await MechanicalEngineeringMechanismsClutchMechanismNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
