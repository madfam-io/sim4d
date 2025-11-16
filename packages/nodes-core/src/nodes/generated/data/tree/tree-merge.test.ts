import { describe, it, expect } from 'vitest';
import { DataTreeTreeMergeNode } from './tree-merge.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeMergeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      treeA: undefined,
      treeB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeMergeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
