import { describe, it, expect } from 'vitest';
import { FabricationRoboticsConveyorTrackingNode } from './conveyor-tracking.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsConveyorTrackingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objectPositions: undefined,
    } as any;
    const params = {
      conveyorSpeed: 100,
      trackingWindow: 500,
    } as any;

    const result = await FabricationRoboticsConveyorTrackingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
