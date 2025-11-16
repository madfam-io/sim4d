import { describe, it, expect } from 'vitest';
import { SolidSurfaceBSplineSurfaceNode } from './bspline-surface.node';
import { createTestContext } from '../test-utils';

describe('SolidSurfaceBSplineSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      controlPoints: undefined,
    } as any;
    const params = {
      uDegree: 3,
      vDegree: 3,
      uPeriodic: false,
      vPeriodic: false,
    } as any;

    const result = await SolidSurfaceBSplineSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
