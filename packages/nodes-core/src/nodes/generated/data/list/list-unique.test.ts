import { describe, it, expect } from 'vitest';
import { DataListListUniqueNode } from './list-unique.node';
import { createTestContext } from '../test-utils';

describe('DataListListUniqueNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListUniqueNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
