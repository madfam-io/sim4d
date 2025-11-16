import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingFuzzySkinnNode } from './fuzzy-skinn.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingFuzzySkinnNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      perimeters: undefined,
    } as any;
    const params = {
      thickness: 0.3,
      pointDistance: 0.75,
    } as any;

    const result = await Fabrication3DPrintingFuzzySkinnNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
