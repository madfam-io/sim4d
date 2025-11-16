import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisSectionCurvesNode } from './section-curves.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisSectionCurvesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      planeNormal: [0, 0, 1],
      spacing: 10,
      count: 10,
    } as any;

    const result = await SurfaceAnalysisSectionCurvesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
