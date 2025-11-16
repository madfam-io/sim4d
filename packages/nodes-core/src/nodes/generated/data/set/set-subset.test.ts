import { describe, it, expect } from 'vitest';
import { DataSetSetSubsetNode } from './set-subset.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetSubsetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetSubsetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
