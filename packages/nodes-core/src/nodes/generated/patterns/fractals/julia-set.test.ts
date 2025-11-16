import { describe, it, expect } from 'vitest';
import { PatternsFractalsJuliaSetNode } from './julia-set.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsJuliaSetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      bounds: undefined,
    } as any;
    const params = {
      cReal: -0.7,
      cImag: 0.27,
      iterations: 100,
      resolution: 100,
    } as any;

    const result = await PatternsFractalsJuliaSetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
