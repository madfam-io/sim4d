import { describe, it, expect } from 'vitest';
import { FieldsVisualizationFieldHeatMapNode } from './field-heat-map.node';
import { createTestContext } from '../test-utils';

describe('FieldsVisualizationFieldHeatMapNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      plane: undefined,
    } as any;
    const params = {
      resolution: 50,
      interpolation: '"bilinear"',
    } as any;

    const result = await FieldsVisualizationFieldHeatMapNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
