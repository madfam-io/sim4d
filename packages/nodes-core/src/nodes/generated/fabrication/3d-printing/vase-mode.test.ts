import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingVaseModeNode } from './vase-mode.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingVaseModeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      bottomLayers: 3,
    } as any;

    const result = await Fabrication3DPrintingVaseModeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
