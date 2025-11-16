import { describe, it, expect } from 'vitest';
import { AnalysisMeasurementVolumeCalculationNode } from './volume-calculation.node';
import { createTestContext } from '../test-utils';

describe('AnalysisMeasurementVolumeCalculationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
    } as any;
    const params = {
      precision: 0.01,
      density: 1,
    } as any;

    const result = await AnalysisMeasurementVolumeCalculationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
