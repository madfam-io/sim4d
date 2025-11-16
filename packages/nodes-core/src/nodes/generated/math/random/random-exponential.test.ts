import { describe, it, expect } from 'vitest';
import { MathRandomRandomExponentialNode } from './random-exponential.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomExponentialNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      lambda: 1,
      seed: -1,
    } as any;

    const result = await MathRandomRandomExponentialNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
