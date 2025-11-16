import { describe, it, expect } from 'vitest';
import { FabricationLaserHatchFillNode } from './hatch-fill.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserHatchFillNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      region: undefined,
    } as any;
    const params = {
      angle: 45,
      spacing: 1,
      crosshatch: false,
    } as any;

    const result = await FabricationLaserHatchFillNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
