import { describe, it, expect } from 'vitest';
import { FabricationRoboticsRobotCalibrationNode } from './robot-calibration.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsRobotCalibrationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      measurementPoints: undefined,
    } as any;
    const params = {
      method: 'dh-parameters',
    } as any;

    const result = await FabricationRoboticsRobotCalibrationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
