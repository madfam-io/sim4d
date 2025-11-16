import { describe, it, expect } from 'vitest';
import { DataListListSliceNode } from './list-slice.node';
import { createTestContext } from '../test-utils';

describe('DataListListSliceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      start: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListSliceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
