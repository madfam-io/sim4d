import { describe, it, expect } from 'vitest';
import { AdvancedSurfaceTrimSurfaceNode } from './trim-surface.node';
import { createTestContext } from '../test-utils';

describe('AdvancedSurfaceTrimSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
      trimmingCurves: undefined,
    } as any;
    const params = {
      keepRegion: 'inside',
      projectCurves: true,
    } as any;

    const result = await AdvancedSurfaceTrimSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
