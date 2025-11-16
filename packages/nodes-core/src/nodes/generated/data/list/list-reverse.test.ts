import { describe, it, expect } from 'vitest';
import { DataListListReverseNode } from './list-reverse.node';
import { createTestContext } from '../test-utils';

describe('DataListListReverseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListReverseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
