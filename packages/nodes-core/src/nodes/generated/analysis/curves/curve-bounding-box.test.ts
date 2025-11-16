import { describe, it, expect } from 'vitest';
import { AnalysisCurvesCurveBoundingBoxNode } from './curve-bounding-box.node';
import { createTestContext } from '../test-utils';

describe('AnalysisCurvesCurveBoundingBoxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      orientation: 'axis-aligned',
      showBox: true,
    } as any;

    const result = await AnalysisCurvesCurveBoundingBoxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
