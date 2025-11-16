import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingIroningPassNode } from './ironing-pass.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingIroningPassNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      topSurfaces: undefined,
    } as any;
    const params = {
      ironingSpeed: 20,
      flowRate: 0.1,
    } as any;

    const result = await Fabrication3DPrintingIroningPassNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
