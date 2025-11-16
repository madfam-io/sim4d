import { describe, it, expect } from 'vitest';
import { PatternsDelaunayAlphaShapeNode } from './alpha-shape.node';
import { createTestContext } from '../test-utils';

describe('PatternsDelaunayAlphaShapeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      alpha: 1,
    } as any;

    const result = await PatternsDelaunayAlphaShapeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
