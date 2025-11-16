import { describe, it, expect } from 'vitest';
import { SketchBasicCircleNode } from './circle.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicCircleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      radius: 50,
      filled: true,
    } as any;

    const result = await SketchBasicCircleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
