import { describe, it, expect } from 'vitest';
import { DataSetSetPermutationsNode } from './set-permutations.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetPermutationsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      set: undefined,
    } as any;
    const params = {
      k: -1,
    } as any;

    const result = await DataSetSetPermutationsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
