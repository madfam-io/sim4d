import { describe, it, expect } from 'vitest';
import { MathRandomPerlinNoiseNode } from './perlin-noise.node';
import { createTestContext } from '../test-utils';

describe('MathRandomPerlinNoiseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      x: undefined,
    } as any;
    const params = {
      octaves: 4,
      persistence: 0.5,
      seed: -1,
    } as any;

    const result = await MathRandomPerlinNoiseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
