import { describe, it, expect } from 'vitest';
import { DataSetSetCombinationsNode } from './set-combinations.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetCombinationsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      set: undefined,
    } as any;
    const params = {
      k: 2,
    } as any;

    const result = await DataSetSetCombinationsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
