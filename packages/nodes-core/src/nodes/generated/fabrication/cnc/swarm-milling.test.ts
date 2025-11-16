import { describe, it, expect } from 'vitest';
import { FabricationCNCSwarmMillingNode } from './swarm-milling.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCSwarmMillingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      passCount: 5,
      overlap: 0.1,
    } as any;

    const result = await FabricationCNCSwarmMillingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
