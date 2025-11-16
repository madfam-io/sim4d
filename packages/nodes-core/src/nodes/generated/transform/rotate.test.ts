import { describe, it, expect } from 'vitest';
import { TransformRotateNode } from './rotate.node';
import { createTestContext } from '../test-utils';

describe('TransformRotateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      angle: 45,
      axisX: 0,
      axisY: 0,
      axisZ: 1,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      copy: true,
    } as any;

    const result = await TransformRotateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
