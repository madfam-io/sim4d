import { describe, it, expect } from 'vitest';
import { MathOperatorsPowerNode } from './power.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsPowerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      base: undefined,
      exponent: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsPowerNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
