import { describe, it, expect } from 'vitest';
import { MathOperatorsNegateNode } from './negate.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsNegateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      value: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsNegateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
