import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingCoolingAnalysisNode } from './cooling-analysis.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingCoolingAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      slices: undefined,
    } as any;
    const params = {
      fanSpeed: 100,
      layerTime: 10,
    } as any;

    const result = await Fabrication3DPrintingCoolingAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
