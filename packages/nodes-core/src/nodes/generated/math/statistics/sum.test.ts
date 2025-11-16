import { describe, it, expect } from 'vitest';
import { MathStatisticsSumNode } from './sum.node';
import { createTestContext } from '../test-utils';

describe('MathStatisticsSumNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await MathStatisticsSumNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
