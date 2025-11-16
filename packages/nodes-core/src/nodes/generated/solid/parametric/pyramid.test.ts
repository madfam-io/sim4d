import { describe, it, expect } from 'vitest';
import { SolidParametricPyramidNode } from './pyramid.node';
import { createTestContext } from '../test-utils';

describe('SolidParametricPyramidNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      baseWidth: 100,
      baseDepth: 100,
      height: 100,
      topWidth: 0,
      topDepth: 0,
    } as any;

    const result = await SolidParametricPyramidNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
