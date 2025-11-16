import { describe, it, expect } from 'vitest';
import { FabricationRoboticsRobotMaintenanceNode } from './robot-maintenance.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsRobotMaintenanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      robotData: undefined,
    } as any;
    const params = {
      operatingHours: 1000,
    } as any;

    const result = await FabricationRoboticsRobotMaintenanceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
