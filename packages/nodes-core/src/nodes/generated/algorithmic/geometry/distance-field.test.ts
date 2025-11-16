import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryDistanceFieldNode } from './distance-field.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryDistanceFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      resolution: 50,
      bounds: '100,100,100',
      signed: true,
    } as any;

    const result = await AlgorithmicGeometryDistanceFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
