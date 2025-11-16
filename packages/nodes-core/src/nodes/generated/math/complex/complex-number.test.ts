import { describe, it, expect } from 'vitest';
import { MathComplexComplexNumberNode } from './complex-number.node';
import { createTestContext } from '../test-utils';

describe('MathComplexComplexNumberNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      real: undefined,
      imaginary: undefined,
    } as any;
    const params = {} as any;

    const result = await MathComplexComplexNumberNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
