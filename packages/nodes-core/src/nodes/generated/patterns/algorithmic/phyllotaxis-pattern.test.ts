import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicPhyllotaxisPatternNode } from './phyllotaxis-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicPhyllotaxisPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      count: 100,
      angle: 137.5,
      c: 1,
    } as any;

    const result = await PatternsAlgorithmicPhyllotaxisPatternNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
