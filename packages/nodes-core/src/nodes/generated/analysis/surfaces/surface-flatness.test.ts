import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceFlatnessNode } from './surface-flatness.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceFlatnessNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      tolerance: 0.1,
      showBestFitPlane: true,
    } as any;

    const result = await AnalysisSurfacesSurfaceFlatnessNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
