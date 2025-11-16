import { describe, it, expect } from 'vitest';
import { FieldsVisualizationFieldVectorArrowsNode } from './field-vector-arrows.node';
import { createTestContext } from '../test-utils';

describe('FieldsVisualizationFieldVectorArrowsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      domain: undefined,
    } as any;
    const params = {
      arrowScale: 1,
      density: 0.5,
    } as any;

    const result = await FieldsVisualizationFieldVectorArrowsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
