import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringMechanismsUniversalJointNode } from './universal-joint.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringMechanismsUniversalJointNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      yokeDiameter: 30,
      crossPinDiameter: 8,
      length: 60,
      angle: 0,
    } as any;

    const result = await MechanicalEngineeringMechanismsUniversalJointNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
