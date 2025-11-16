import { describe, it, expect } from 'vitest';
import { FabricationRoboticsJointLimitAvoidanceNode } from './joint-limit-avoidance.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsJointLimitAvoidanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      jointTrajectory: undefined,
    } as any;
    const params = {
      margin: 5,
    } as any;

    const result = await FabricationRoboticsJointLimitAvoidanceNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
