import { describe, it, expect } from 'vitest';
import { DataSetSetIntersectionNode } from './set-intersection.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetIntersectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      setA: undefined,
      setB: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetIntersectionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
