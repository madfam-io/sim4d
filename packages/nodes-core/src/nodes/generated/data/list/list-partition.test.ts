import { describe, it, expect } from 'vitest';
import { DataListListPartitionNode } from './list-partition.node';
import { createTestContext } from '../test-utils';

describe('DataListListPartitionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      size: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListPartitionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
