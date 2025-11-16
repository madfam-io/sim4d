import { describe, it, expect } from 'vitest';
import { DataSetSetUnionNode } from './set-union.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetUnionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetUnionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
