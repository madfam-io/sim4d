import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryMinimumSpanningTreeNode } from './minimum-spanning-tree.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryMinimumSpanningTreeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      algorithm: 'kruskal',
      showWeights: false,
    } as any;

    const result = await AlgorithmicGeometryMinimumSpanningTreeNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
