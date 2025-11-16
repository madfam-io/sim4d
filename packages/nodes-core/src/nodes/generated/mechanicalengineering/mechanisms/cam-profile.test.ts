import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringMechanismsCamProfileNode } from './cam-profile.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringMechanismsCamProfileNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      baseRadius: 30,
      lift: 10,
      profileType: 'harmonic',
      dwellAngle: 60,
    } as any;

    const result = await MechanicalEngineeringMechanismsCamProfileNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
