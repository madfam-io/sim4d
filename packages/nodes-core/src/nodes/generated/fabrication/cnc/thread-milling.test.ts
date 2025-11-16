import { describe, it, expect } from 'vitest';
import { FabricationCNCThreadMillingNode } from './thread-milling.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCThreadMillingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      holes: undefined,
    } as any;
    const params = {
      threadPitch: 1.5,
      threadDepth: 1,
      passes: 3,
    } as any;

    const result = await FabricationCNCThreadMillingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
