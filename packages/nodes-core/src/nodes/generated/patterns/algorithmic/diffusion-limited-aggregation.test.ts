import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicDiffusionLimitedAggregationNode } from './diffusion-limited-aggregation.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicDiffusionLimitedAggregationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      seed: undefined,
    } as any;
    const params = {
      particles: 1000,
      stickiness: 1,
    } as any;

    const result = await PatternsAlgorithmicDiffusionLimitedAggregationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
