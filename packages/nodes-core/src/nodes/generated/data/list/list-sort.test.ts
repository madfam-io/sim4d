import { describe, it, expect } from 'vitest';
import { DataListListSortNode } from './list-sort.node';
import { createTestContext } from '../test-utils';

describe('DataListListSortNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {
      ascending: true,
    } as any;

    const result = await DataListListSortNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
