import { describe, it, expect } from 'vitest';
import { SketchCurvesSpiralNode } from './spiral.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesSpiralNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      startRadius: 10,
      endRadius: 100,
      turns: 3,
      type: 'archimedean',
    } as any;

    const result = await SketchCurvesSpiralNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
