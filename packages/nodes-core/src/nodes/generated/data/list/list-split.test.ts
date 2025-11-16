import { describe, it, expect } from 'vitest';
import { DataListListSplitNode } from './list-split.node';
import { createTestContext } from '../test-utils';

describe('DataListListSplitNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      index: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListSplitNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
