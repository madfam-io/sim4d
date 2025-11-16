import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringMechanismsLinkageMechanismNode } from './linkage-mechanism.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringMechanismsLinkageMechanismNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      basePoints: undefined,
    } as any;
    const params = {
      type: 'four-bar',
      linkLength1: 50,
      linkLength2: 80,
      linkLength3: 60,
      angle: 0,
    } as any;

    const result = await MechanicalEngineeringMechanismsLinkageMechanismNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
