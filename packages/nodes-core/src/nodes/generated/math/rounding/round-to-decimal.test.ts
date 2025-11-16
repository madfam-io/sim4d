import { describe, it, expect } from 'vitest';
import { MathRoundingRoundToDecimalNode } from './round-to-decimal.node';
import { createTestContext } from '../test-utils';

describe('MathRoundingRoundToDecimalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {
      decimals: 2,
    } as any;

    const result = await MathRoundingRoundToDecimalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
