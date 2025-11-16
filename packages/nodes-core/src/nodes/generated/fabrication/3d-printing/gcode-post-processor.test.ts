import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingGCodePostProcessorNode } from './gcode-post-processor.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingGCodePostProcessorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpaths: undefined,
    } as any;
    const params = {
      flavor: 'marlin',
      optimize: true,
    } as any;

    const result = await Fabrication3DPrintingGCodePostProcessorNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
