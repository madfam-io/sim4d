import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingPerimeterGeneratorNode } from './perimeter-generator.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingPerimeterGeneratorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      slice: undefined,
    } as any;
    const params = {
      perimeters: 3,
      extrusionWidth: 0.4,
    } as any;

    const result = await Fabrication3DPrintingPerimeterGeneratorNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
