import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingWallThicknessNode } from './wall-thickness.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingWallThicknessNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      minThickness: 1,
      maxThickness: 10,
    } as any;

    const result = await Fabrication3DPrintingWallThicknessNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
