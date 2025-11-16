import { describe, it, expect } from 'vitest';
import { AnalysisProximityVisibilityAnalysisNode } from './visibility-analysis.node';
import { createTestContext } from '../test-utils';

describe('AnalysisProximityVisibilityAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      viewpoint: undefined,
      targets: undefined,
    } as any;
    const params = {
      viewAngle: 120,
      maxDistance: 100,
    } as any;

    const result = await AnalysisProximityVisibilityAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
