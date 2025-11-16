import { describe, it, expect } from 'vitest';
import { SketchBasicRectangleNode } from './rectangle.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicRectangleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      centerX: 0,
      centerY: 0,
      width: 100,
      height: 50,
      filled: true,
      cornerRadius: 0,
    } as any;

    const result = await SketchBasicRectangleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
