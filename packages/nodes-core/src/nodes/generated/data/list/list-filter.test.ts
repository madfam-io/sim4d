import { describe, it, expect } from 'vitest';
import { DataListListFilterNode } from './list-filter.node';
import { createTestContext } from '../test-utils';

describe('DataListListFilterNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      mask: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListFilterNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
