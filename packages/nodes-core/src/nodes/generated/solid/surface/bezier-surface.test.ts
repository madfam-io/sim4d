import { describe, it, expect } from 'vitest';
import { SolidSurfaceBezierSurfaceNode } from './bezier-surface.node';
import { createTestContext } from '../test-utils';

describe('SolidSurfaceBezierSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      controlPoints: undefined,
    } as any;
    const params = {
      uDegree: 3,
      vDegree: 3,
    } as any;

    const result = await SolidSurfaceBezierSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
