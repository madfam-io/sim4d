import { describe, it, expect } from 'vitest';
import { DataSetSetCartesianProductNode } from './set-cartesian-product.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetCartesianProductNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetCartesianProductNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
