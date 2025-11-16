import { describe, it, expect } from 'vitest';
import { MathStatisticsStandardDeviationNode } from './standard-deviation.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsStandardDeviationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {
      sample: false,
    } as any;

    const result = await MathStatisticsStandardDeviationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
