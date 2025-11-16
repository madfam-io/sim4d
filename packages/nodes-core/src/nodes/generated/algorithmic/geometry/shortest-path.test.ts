import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryShortestPathNode } from './shortest-path.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryShortestPathNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      graph: undefined,
      start: undefined,
      end: undefined,
    } as any;
    const params = {
      algorithm: 'dijkstra',
      heuristic: 'euclidean',
    } as any;

    const result = await AlgorithmicGeometryShortestPathNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
