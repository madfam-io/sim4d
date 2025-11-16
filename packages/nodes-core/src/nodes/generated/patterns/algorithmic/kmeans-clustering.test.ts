import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicKMeansClusteringNode } from './kmeans-clustering.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicKMeansClusteringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      k: 5,
      iterations: 100,
    } as any;

    const result = await PatternsAlgorithmicKMeansClusteringNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
