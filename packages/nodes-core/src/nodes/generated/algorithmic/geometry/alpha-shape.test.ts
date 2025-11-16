import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryAlphaShapeNode } from './alpha-shape.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryAlphaShapeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      alpha: 1,
      mode: '3D',
    } as any;

    const result = await AlgorithmicGeometryAlphaShapeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
