import { describe, it, expect } from 'vitest';
import { AnalysisQualityGeometryValidationNode } from './geometry-validation.node';
import { createTestContext } from '../test-utils';

describe('AnalysisQualityGeometryValidationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      checkClosed: true,
      checkValid: true,
    } as any;

    const result = await AnalysisQualityGeometryValidationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
