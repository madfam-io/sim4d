import { describe, it, expect } from 'vitest';
import { MathStatisticsProductNode } from './product.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsProductNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsProductNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
