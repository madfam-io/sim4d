import { describe, it, expect } from 'vitest';
import { DataListListPrependNode } from './list-prepend.node';
import { createTestContext } from '../test-utils';

describe('DataListListPrependNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      item: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListPrependNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
