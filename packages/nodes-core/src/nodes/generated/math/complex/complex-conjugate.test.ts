import { describe, it, expect } from 'vitest';
import { MathComplexComplexConjugateNode } from './complex-conjugate.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexConjugateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      complex: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexConjugateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
