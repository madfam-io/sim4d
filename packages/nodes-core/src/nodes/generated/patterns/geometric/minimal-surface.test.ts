import { describe, it, expect } from 'vitest';
import { PatternsGeometricMinimalSurfaceNode } from './minimal-surface.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricMinimalSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      box: undefined,
    } as any;
    const params = {
      type: 'gyroid',
      period: 10,
    } as any;

    const result = await PatternsGeometricMinimalSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
