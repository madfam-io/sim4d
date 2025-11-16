import { describe, it, expect } from 'vitest';
import { MathOperatorsMultiplyNode } from './multiply.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsMultiplyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsMultiplyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
