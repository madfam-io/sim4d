import { describe, it, expect } from 'vitest';
import { FieldsAnalysisFieldCriticalPointsNode } from './field-critical-points.node';
import { createTestContext } from '../test-utils';

describe('FieldsAnalysisFieldCriticalPointsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      tolerance: 0.001,
      type: '"all"',
    } as any;

    const result = await FieldsAnalysisFieldCriticalPointsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
