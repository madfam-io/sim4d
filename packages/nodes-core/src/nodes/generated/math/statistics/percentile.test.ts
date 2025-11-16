import { describe, it, expect } from 'vitest';
import { MathStatisticsPercentileNode } from './percentile.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsPercentileNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {
      percentile: 50,
    } as any;

    const result = await MathStatisticsPercentileNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
