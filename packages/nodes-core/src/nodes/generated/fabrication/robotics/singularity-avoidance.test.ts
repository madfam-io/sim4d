import { describe, it, expect } from 'vitest';
import { FabricationRoboticsSingularityAvoidanceNode } from './singularity-avoidance.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsSingularityAvoidanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      jointTrajectory: undefined,
    } as any;
    const params = {
      threshold: 0.1,
    } as any;

    const result = await FabricationRoboticsSingularityAvoidanceNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
