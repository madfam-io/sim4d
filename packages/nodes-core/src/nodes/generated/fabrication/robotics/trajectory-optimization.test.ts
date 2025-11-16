import { describe, it, expect } from 'vitest';
import { FabricationRoboticsTrajectoryOptimizationNode } from './trajectory-optimization.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsTrajectoryOptimizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      trajectory: undefined,
    } as any;
    const params = {
      objective: 'time',
      maxVelocity: 1000,
      maxAcceleration: 5000,
    } as any;

    const result = await FabricationRoboticsTrajectoryOptimizationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
