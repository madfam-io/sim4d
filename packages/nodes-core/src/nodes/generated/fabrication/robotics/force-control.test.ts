import { describe, it, expect } from 'vitest';
import { FabricationRoboticsForceControlNode } from './force-control.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsForceControlNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      contactSurface: undefined,
    } as any;
    const params = {
      forceLimit: 100,
      compliance: 0.5,
    } as any;

    const result = await FabricationRoboticsForceControlNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
