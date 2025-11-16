import { describe, it, expect } from 'vitest';
import { AnalysisMeasurementAngleMeasurementNode } from './angle-measurement.node';
import { createTestContext } from '../test-utils';

describe('AnalysisMeasurementAngleMeasurementNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      vector1: undefined,
      vector2: undefined,
    } as any;
    const params = {
      units: 'degrees',
      showAnnotation: true,
    } as any;

    const result = await AnalysisMeasurementAngleMeasurementNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
