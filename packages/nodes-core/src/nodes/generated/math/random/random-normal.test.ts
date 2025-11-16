import { describe, it, expect } from 'vitest';
import { MathRandomRandomNormalNode } from './random-normal.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomNormalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      mean: 0,
      stddev: 1,
      seed: -1,
    } as any;

    const result = await MathRandomRandomNormalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
