import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryGeometrySimplificationNode } from './geometry-simplification.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryGeometrySimplificationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      algorithm: 'quadric',
      reduction: 0.5,
      preserveBoundary: true,
    } as any;

    const result = await AlgorithmicGeometryGeometrySimplificationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
