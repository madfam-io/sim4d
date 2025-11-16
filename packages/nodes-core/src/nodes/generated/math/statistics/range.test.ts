import { describe, it, expect } from 'vitest';
import { MathStatisticsRangeNode } from './range.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsRangeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsRangeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
