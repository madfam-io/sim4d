import { describe, it, expect } from 'vitest';
import { DataListListJoinNode } from './list-join.node';
import { createTestContext } from '../test-utils';

describe('DataListListJoinNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      lists: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListJoinNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
