import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingAdaptiveLayerHeightNode } from './adaptive-layer-height.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingAdaptiveLayerHeightNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      minHeight: 0.1,
      maxHeight: 0.3,
      quality: 0.5,
    } as any;

    const result = await Fabrication3DPrintingAdaptiveLayerHeightNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
