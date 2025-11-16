import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometrySpacePartitioningNode } from './space-partitioning.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometrySpacePartitioningNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objects: undefined,
    } as any;
    const params = {
      type: 'octree',
      maxDepth: 8,
      leafSize: 10,
    } as any;

    const result = await AlgorithmicGeometrySpacePartitioningNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
