import { describe, it, expect } from 'vitest';
import { TransformScaleNode } from './scale.node';
import { createTestContext } from '../test-utils';

describe('TransformScaleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      uniform: true,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      copy: true,
    } as any;

    const result = await TransformScaleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
