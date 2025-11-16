import { describe, it, expect } from 'vitest';
import { MathRandomSimplexNoiseNode } from './simplex-noise.node';
import { createTestContext } from '../test-utils';

describe('MathRandomSimplexNoiseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      x: undefined,
    } as any;
    const params = {
      scale: 1,
      seed: -1,
    } as any;

    const result = await MathRandomSimplexNoiseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
