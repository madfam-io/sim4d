import { describe, it, expect } from 'vitest';
import { MathComparisonMinNode } from './min.node';
import { createTestContext } from '../test-utils';

describe('MathComparisonMinNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComparisonMinNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
