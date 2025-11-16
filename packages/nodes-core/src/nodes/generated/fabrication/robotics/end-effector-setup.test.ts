import { describe, it, expect } from 'vitest';
import { FabricationRoboticsEndEffectorSetupNode } from './end-effector-setup.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsEndEffectorSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      toolType: 'gripper',
      tcpOffset: '[0, 0, 100]',
    } as any;

    const result = await FabricationRoboticsEndEffectorSetupNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
