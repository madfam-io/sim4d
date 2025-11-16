import { describe, it, expect } from 'vitest';
import { PatternsNetworkRelativeNeighborhoodNode } from './relative-neighborhood.node';
import { createTestContext } from '../test-utils';

describe('PatternsNetworkRelativeNeighborhoodNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {} as any;

    const result = await PatternsNetworkRelativeNeighborhoodNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
