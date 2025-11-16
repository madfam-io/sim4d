import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingSeamOptimizationNode } from './seam-optimization.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingSeamOptimizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      slices: undefined,
    } as any;
    const params = {
      strategy: 'hidden',
    } as any;

    const result = await Fabrication3DPrintingSeamOptimizationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
