import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingCoastingSetupNode } from './coasting-setup.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingCoastingSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      extrusions: undefined,
    } as any;
    const params = {
      coastVolume: 0.064,
      minVolume: 0.8,
    } as any;

    const result = await Fabrication3DPrintingCoastingSetupNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
