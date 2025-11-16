import { describe, it, expect } from 'vitest';
import { MathComparisonMaxNode } from './max.node';
import { createTestContext } from '../test-utils';

describe('MathComparisonMaxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComparisonMaxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
