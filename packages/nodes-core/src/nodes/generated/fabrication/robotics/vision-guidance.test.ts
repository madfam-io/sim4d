import { describe, it, expect } from 'vitest';
import { FabricationRoboticsVisionGuidanceNode } from './vision-guidance.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsVisionGuidanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetFeatures: undefined,
    } as any;
    const params = {
      cameraType: '3d',
      patternType: 'aruco',
    } as any;

    const result = await FabricationRoboticsVisionGuidanceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
