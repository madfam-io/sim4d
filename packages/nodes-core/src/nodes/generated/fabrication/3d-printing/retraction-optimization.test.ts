import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingRetractionOptimizationNode } from './retraction-optimization.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingRetractionOptimizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpath: undefined,
    } as any;
    const params = {
      retractionDistance: 1,
      minTravelDistance: 2,
    } as any;

    const result = await Fabrication3DPrintingRetractionOptimizationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
