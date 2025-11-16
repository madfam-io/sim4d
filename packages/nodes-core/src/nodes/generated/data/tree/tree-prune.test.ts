import { describe, it, expect } from 'vitest';
import { DataTreeTreePruneNode } from './tree-prune.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreePruneNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreePruneNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
