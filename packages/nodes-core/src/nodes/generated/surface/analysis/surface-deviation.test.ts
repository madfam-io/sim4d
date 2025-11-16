import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisSurfaceDeviationNode } from './surface-deviation.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisSurfaceDeviationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface1: undefined,
      surface2: undefined,
    } as any;
    const params = {
      sampleCount: 1000,
    } as any;

    const result = await SurfaceAnalysisSurfaceDeviationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
