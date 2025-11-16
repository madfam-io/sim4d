import { describe, it, expect } from 'vitest';
import { SurfaceNURBSGordonSurfaceNode } from './gordon-surface.node';
import { createTestContext } from '../test-utils';

describe('SurfaceNURBSGordonSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      uCurves: undefined,
      vCurves: undefined,
    } as any;
    const params = {} as any;

    const result = await SurfaceNURBSGordonSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
