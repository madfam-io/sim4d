import { describe, it, expect } from 'vitest';
import { MathRandomRandomPoissonNode } from './random-poisson.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomPoissonNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      lambda: 1,
      seed: -1,
    } as any;

    const result = await MathRandomRandomPoissonNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
