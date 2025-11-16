import { describe, it, expect } from 'vitest';
import { MathStatisticsVarianceNode } from './variance.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsVarianceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {
      sample: false,
    } as any;

    const result = await MathStatisticsVarianceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
