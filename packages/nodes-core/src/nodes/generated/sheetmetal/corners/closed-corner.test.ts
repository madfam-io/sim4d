import { describe, it, expect } from 'vitest';
import { SheetMetalCornersClosedCornerNode } from './closed-corner.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalCornersClosedCornerNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      faces: undefined,
    } as any;
    const params = {
      cornerType: 'overlap',
      gapDistance: 0,
      overlapRatio: 0.5,
    } as any;

    const result = await SheetMetalCornersClosedCornerNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
