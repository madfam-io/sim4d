import { describe, it, expect } from 'vitest';
import { MathComparisonClampNode } from './clamp.node';
import { createTestContext } from '../test-utils';

describe('MathComparisonClampNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
      min: undefined,
      max: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComparisonClampNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
