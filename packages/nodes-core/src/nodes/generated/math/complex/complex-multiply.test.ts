import { describe, it, expect } from 'vitest';
import { MathComplexComplexMultiplyNode } from './complex-multiply.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexMultiplyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexMultiplyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
