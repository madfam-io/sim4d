import { describe, it, expect } from 'vitest';
import { FabricationRoboticsCollisionAvoidanceNode } from './collision-avoidance.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsCollisionAvoidanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      robotPath: undefined,
      environment: undefined,
    } as any;
    const params = {
      safetyMargin: 10,
    } as any;

    const result = await FabricationRoboticsCollisionAvoidanceNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
