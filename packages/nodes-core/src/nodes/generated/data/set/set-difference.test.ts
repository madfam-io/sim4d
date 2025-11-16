import { describe, it, expect } from 'vitest';
import { DataSetSetDifferenceNode } from './set-difference.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetDifferenceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetDifferenceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
