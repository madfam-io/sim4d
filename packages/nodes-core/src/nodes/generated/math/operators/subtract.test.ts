import { describe, it, expect } from 'vitest';
import { MathOperatorsSubtractNode } from './subtract.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsSubtractNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsSubtractNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
