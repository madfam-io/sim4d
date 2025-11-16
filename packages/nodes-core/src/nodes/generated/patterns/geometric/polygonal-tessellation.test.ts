import { describe, it, expect } from 'vitest';
import { PatternsGeometricPolygonalTessellationNode } from './polygonal-tessellation.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricPolygonalTessellationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      polygonType: 'hexagonal',
      size: 10,
    } as any;

    const result = await PatternsGeometricPolygonalTessellationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
