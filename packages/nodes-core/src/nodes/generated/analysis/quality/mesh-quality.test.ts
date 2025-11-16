import { describe, it, expect } from 'vitest';
import { AnalysisQualityMeshQualityNode } from './mesh-quality.node';
import { createTestContext } from '../test-utils';

describe('AnalysisQualityMeshQualityNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      aspectRatioThreshold: 5,
      skewnessThreshold: 0.8,
    } as any;

    const result = await AnalysisQualityMeshQualityNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
