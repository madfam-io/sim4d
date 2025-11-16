import { describe, it, expect } from 'vitest';
import { FabricationLaserEngraveRasterNode } from './engrave-raster.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserEngraveRasterNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      image: undefined,
      boundary: undefined,
    } as any;
    const params = {
      resolution: 300,
      dithering: 'floyd-steinberg',
    } as any;

    const result = await FabricationLaserEngraveRasterNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
