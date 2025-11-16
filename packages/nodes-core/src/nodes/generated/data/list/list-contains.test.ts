import { describe, it, expect } from 'vitest';
import { DataListListContainsNode } from './list-contains.node';
import { createTestContext } from '../test-utils';

describe('DataListListContainsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      item: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListContainsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
