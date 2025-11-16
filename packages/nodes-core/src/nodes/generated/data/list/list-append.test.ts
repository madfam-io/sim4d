import { describe, it, expect } from 'vitest';
import { DataListListAppendNode } from './list-append.node';
import { createTestContext } from '../test-utils';

describe('DataListListAppendNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      item: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListAppendNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
