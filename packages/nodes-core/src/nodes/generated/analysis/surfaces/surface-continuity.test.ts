import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceContinuityNode } from './surface-continuity.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceContinuityNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface1: undefined,
      surface2: undefined,
    } as any;
    const params = {
      continuityType: 'G1',
      tolerance: 0.01,
      showAnalysis: true,
    } as any;

    const result = await AnalysisSurfacesSurfaceContinuityNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
