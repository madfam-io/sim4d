import { describe, it, expect } from 'vitest';
import { MathStatisticsAverageNode } from './average.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsAverageNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsAverageNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
