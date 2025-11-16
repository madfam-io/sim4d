import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringMechanismsRatchetMechanismNode } from './ratchet-mechanism.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringMechanismsRatchetMechanismNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      wheelDiameter: 50,
      teeth: 24,
      pawlLength: 20,
      springTension: 5,
    } as any;

    const result = await MechanicalEngineeringMechanismsRatchetMechanismNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
