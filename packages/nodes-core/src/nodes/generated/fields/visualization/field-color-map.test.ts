import { describe, it, expect } from 'vitest';
import { FieldsVisualizationFieldColorMapNode } from './field-color-map.node';
import { createTestContext } from '../test-utils';

describe('FieldsVisualizationFieldColorMapNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      colorScheme: '"viridis"',
      minValue: 0,
      maxValue: 1,
    } as any;

    const result = await FieldsVisualizationFieldColorMapNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
