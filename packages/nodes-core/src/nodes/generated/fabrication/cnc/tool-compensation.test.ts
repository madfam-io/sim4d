import { describe, it, expect } from 'vitest';
import { FabricationCNCToolCompensationNode } from './tool-compensation.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCToolCompensationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      toolRadius: 3,
      wearOffset: 0,
    } as any;

    const result = await FabricationCNCToolCompensationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
