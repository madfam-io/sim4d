import { describe, it, expect } from 'vitest';
import { SurfaceCurveOpsCurveOnSurfaceNode } from './curve-on-surface.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurveOpsCurveOnSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
      uvPoints: undefined,
    } as any;
    const params = {} as any;

    const result = await SurfaceCurveOpsCurveOnSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
