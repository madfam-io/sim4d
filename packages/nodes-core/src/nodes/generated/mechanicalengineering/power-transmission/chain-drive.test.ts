import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringPowerTransmissionChainDriveNode } from './chain-drive.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringPowerTransmissionChainDriveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sprocket1Center: undefined,
      sprocket2Center: undefined,
    } as any;
    const params = {
      driveTeeth: 17,
      drivenTeeth: 42,
      chainPitch: 12.7,
      chainRows: 1,
    } as any;

    const result = await MechanicalEngineeringPowerTransmissionChainDriveNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
