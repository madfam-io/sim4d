import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingNonPlanarSlicingNode } from './non-planar-slicing.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingNonPlanarSlicingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      maxAngle: 30,
    } as any;

    const result = await Fabrication3DPrintingNonPlanarSlicingNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
