import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingPrintOrientationNode } from './print-orientation.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingPrintOrientationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      optimize: 'support',
      constraints: false,
    } as any;

    const result = await Fabrication3DPrintingPrintOrientationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
