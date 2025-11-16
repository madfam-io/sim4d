import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingInfillOptimizationNode } from './infill-optimization.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingInfillOptimizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      minDensity: 0.1,
      maxDensity: 0.5,
      gradientDistance: 5,
    } as any;

    const result = await Fabrication3DPrintingInfillOptimizationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
