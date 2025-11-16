import { describe, it, expect } from 'vitest';
import { SketchCurvesEllipseNode } from './ellipse.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesEllipseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      majorRadius: 100,
      minorRadius: 50,
      startAngle: 0,
      endAngle: 360,
    } as any;

    const result = await SketchCurvesEllipseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
