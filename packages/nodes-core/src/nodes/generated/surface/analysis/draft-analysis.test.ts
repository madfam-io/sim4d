import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisDraftAnalysisNode } from './draft-analysis.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisDraftAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      pullDirection: [0, 0, 1],
      requiredAngle: 3,
      colorMapping: true,
    } as any;

    const result = await SurfaceAnalysisDraftAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
