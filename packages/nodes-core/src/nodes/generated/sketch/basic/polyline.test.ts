import { describe, it, expect } from 'vitest';
import { SketchBasicPolylineNode } from './polyline.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicPolylineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      closed: false,
    } as any;

    const result = await SketchBasicPolylineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
