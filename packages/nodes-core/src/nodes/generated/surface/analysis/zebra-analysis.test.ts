import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisZebraAnalysisNode } from './zebra-analysis.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisZebraAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      stripeCount: 20,
      stripeDirection: [0, 0, 1],
      stripeWidth: 1,
    } as any;

    const result = await SurfaceAnalysisZebraAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
