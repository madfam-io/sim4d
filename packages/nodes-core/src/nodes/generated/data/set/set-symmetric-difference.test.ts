import { describe, it, expect } from 'vitest';
import { DataSetSetSymmetricDifferenceNode } from './set-symmetric-difference.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetSymmetricDifferenceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetSymmetricDifferenceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
