import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicShortestPathNode } from './shortest-path.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicShortestPathNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      graph: undefined,
      start: undefined,
      end: undefined,
    } as any;
    const params = {
      algorithm: 'dijkstra',
    } as any;

    const result = await PatternsAlgorithmicShortestPathNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
