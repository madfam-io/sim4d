import { describe, it, expect } from 'vitest';
import { SketchCurvesTrimNode } from './trim.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesTrimNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
    } as any;
    const params = {
      startParameter: 0,
      endParameter: 1,
    } as any;

    const result = await SketchCurvesTrimNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
