import { describe, it, expect } from 'vitest';
import { SurfaceNURBSNurbsSurfaceNode } from './nurbs-surface.node';
import { createTestContext } from '../test-utils';

describe('SurfaceNURBSNurbsSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      controlPoints: undefined,
    } as any;
    const params = {
      degreeU: 3,
      degreeV: 3,
      periodicU: false,
      periodicV: false,
    } as any;

    const result = await SurfaceNURBSNurbsSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
