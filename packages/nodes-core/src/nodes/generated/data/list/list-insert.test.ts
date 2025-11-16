import { describe, it, expect } from 'vitest';
import { DataListListInsertNode } from './list-insert.node';
import { createTestContext } from '../test-utils';

describe('DataListListInsertNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      item: undefined,
      index: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListInsertNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
