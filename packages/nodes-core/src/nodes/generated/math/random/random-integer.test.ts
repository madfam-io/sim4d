import { describe, it, expect } from 'vitest';
import { MathRandomRandomIntegerNode } from './random-integer.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomIntegerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      min: undefined,
      max: undefined,
    } as any;
    const params = {
      seed: -1,
    } as any;

    const result = await MathRandomRandomIntegerNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
