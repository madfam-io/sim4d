import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringBearingsSphericalBearingNode } from './spherical-bearing.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringBearingsSphericalBearingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      ballDiameter: 20,
      boreDiameter: 8,
      housingDiameter: 30,
      misalignmentAngle: 15,
    } as any;

    const result = await MechanicalEngineeringBearingsSphericalBearingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
