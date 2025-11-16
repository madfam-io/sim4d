import { describe, it, expect } from 'vitest';
import { PatternsGeometricSpiralPatternNode } from './spiral-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricSpiralPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      spiralType: 'logarithmic',
      turns: 5,
      growth: 1.2,
    } as any;

    const result = await PatternsGeometricSpiralPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
