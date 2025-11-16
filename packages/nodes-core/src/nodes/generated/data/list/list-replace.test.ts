import { describe, it, expect } from 'vitest';
import { DataListListReplaceNode } from './list-replace.node';
import { createTestContext } from '../test-utils';

describe('DataListListReplaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      item: undefined,
      index: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListReplaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
