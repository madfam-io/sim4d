import { describe, it, expect } from 'vitest';
import { FabricationRoboticsMultiRobotCoordinationNode } from './multi-robot-coordination.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsMultiRobotCoordinationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      robotPaths: undefined,
    } as any;
    const params = {
      syncMethod: 'position',
    } as any;

    const result = await FabricationRoboticsMultiRobotCoordinationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
