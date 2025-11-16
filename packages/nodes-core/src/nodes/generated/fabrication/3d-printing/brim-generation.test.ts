import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingBrimGenerationNode } from './brim-generation.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingBrimGenerationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      brimWidth: 10,
      brimLines: 20,
    } as any;

    const result = await Fabrication3DPrintingBrimGenerationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
