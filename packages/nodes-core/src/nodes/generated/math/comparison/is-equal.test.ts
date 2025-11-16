import { describe, it, expect } from 'vitest';
import { MathComparisonIsEqualNode } from './is-equal.node';
import { createTestContext } from '../test-utils';

describe('MathComparisonIsEqualNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {
      tolerance: 0.0001,
    } as any;

    const result = await MathComparisonIsEqualNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
