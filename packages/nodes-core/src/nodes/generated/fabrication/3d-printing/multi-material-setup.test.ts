import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingMultiMaterialSetupNode } from './multi-material-setup.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingMultiMaterialSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      regions: undefined,
    } as any;
    const params = {
      materials: 2,
      purgeVolume: 50,
    } as any;

    const result = await Fabrication3DPrintingMultiMaterialSetupNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
