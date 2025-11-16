import { describe, it, expect } from 'vitest';
import { DataSetSetPartitionsNode } from './set-partitions.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetPartitionsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      set: undefined,
    } as any;
    const params = {
      k: 2,
    } as any;

    const result = await DataSetSetPartitionsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
