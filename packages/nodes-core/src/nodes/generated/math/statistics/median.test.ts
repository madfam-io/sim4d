import { describe, it, expect } from 'vitest';
import { MathStatisticsMedianNode } from './median.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsMedianNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsMedianNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
