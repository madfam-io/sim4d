import { describe, it, expect } from 'vitest';
import { SketchBasicLineNode } from './line.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicLineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      startX: 0,
      startY: 0,
      startZ: 0,
      endX: 100,
      endY: 0,
      endZ: 0,
    } as any;

    const result = await SketchBasicLineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
