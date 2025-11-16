import { describe, it, expect } from 'vitest';
import { MathOperatorsFactorialNode } from './factorial.node';
import { createTestContext } from '../test-utils';

describe('MathOperatorsFactorialNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      n: undefined,
    } as any;
    const params = {} as any;

    const result = await MathOperatorsFactorialNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
