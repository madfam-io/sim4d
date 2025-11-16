import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingSliceModelNode } from './slice-model.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingSliceModelNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      layerHeight: 0.2,
      infillDensity: 0.2,
      infillPattern: 'grid',
    } as any;

    const result = await Fabrication3DPrintingSliceModelNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
