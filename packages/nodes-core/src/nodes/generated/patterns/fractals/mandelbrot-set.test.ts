import { describe, it, expect } from 'vitest';
import { PatternsFractalsMandelbrotSetNode } from './mandelbrot-set.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsMandelbrotSetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      iterations: 100,
      resolution: 200,
      zoom: 1,
    } as any;

    const result = await PatternsFractalsMandelbrotSetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
