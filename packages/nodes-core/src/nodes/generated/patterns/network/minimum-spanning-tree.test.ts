import { describe, it, expect } from 'vitest';
import { PatternsNetworkMinimumSpanningTreeNode } from './minimum-spanning-tree.node';
import { createTestContext } from '../test-utils';

describe('PatternsNetworkMinimumSpanningTreeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {} as any;

    const result = await PatternsNetworkMinimumSpanningTreeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
