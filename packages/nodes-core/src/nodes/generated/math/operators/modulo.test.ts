import { describe, it, expect } from 'vitest';
import { MathOperatorsModuloNode } from './modulo.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsModuloNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      a: undefined,
      b: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsModuloNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
