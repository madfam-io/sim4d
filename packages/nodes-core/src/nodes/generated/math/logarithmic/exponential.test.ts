import { describe, it, expect } from 'vitest';
import { MathLogarithmicExponentialNode } from './exponential.node';
import { createTestContext } from '../test-utils';

describe('MathLogarithmicExponentialNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathLogarithmicExponentialNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
