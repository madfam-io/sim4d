import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringPowerTransmissionPulleySystemNode } from './pulley-system.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringPowerTransmissionPulleySystemNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      driveCenter: undefined,
      drivenCenter: undefined,
    } as any;
    const params = {
      driveDiameter: 100,
      drivenDiameter: 200,
      beltWidth: 20,
      centerDistance: 300,
    } as any;

    const result = await MechanicalEngineeringPowerTransmissionPulleySystemNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
