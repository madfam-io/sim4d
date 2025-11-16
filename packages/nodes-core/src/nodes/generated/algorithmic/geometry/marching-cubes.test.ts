import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryMarchingCubesNode } from './marching-cubes.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryMarchingCubesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      scalarField: undefined,
    } as any;
    const params = {
      isovalue: 0,
      resolution: 32,
      smooth: true,
    } as any;

    const result = await AlgorithmicGeometryMarchingCubesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
