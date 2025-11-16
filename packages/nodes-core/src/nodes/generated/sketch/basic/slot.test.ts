import { describe, it, expect } from 'vitest';
import { SketchBasicSlotNode } from './slot.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicSlotNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      centerX: 0,
      centerY: 0,
      length: 100,
      width: 20,
      angle: 0,
    } as any;

    const result = await SketchBasicSlotNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
