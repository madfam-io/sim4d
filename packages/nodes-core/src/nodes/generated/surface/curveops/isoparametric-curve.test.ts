import { describe, it, expect, vi } from 'vitest';
import { IsoparametricCurveNode } from './isoparametric-curve.node';
import { createTestContext } from './../../test-utils';

describe('IsoparametricCurveNode', () => {
  it('should create IsoparametricCurve', async () => {
    const context = createTestContext();
    const executeSpy = vi.fn().mockResolvedValue({ id: 'iso-1' });
    context.geometry.execute = executeSpy;

    const surface = { id: 'face-1' } as any;
    const params = {
      direction: 'U',
      parameter: 0.5,
    } as any;

    const result = await IsoparametricCurveNode.evaluate(
      context as any,
      { surface } as any,
      params
    );

    expect(executeSpy).toHaveBeenCalledWith({
      type: 'ISOPARAMETRIC_CURVE',
      params: {
        surface,
        direction: 'U',
        parameter: 0.5,
      },
    });

    expect(result).toEqual({ isoCurve: { id: 'iso-1' } });
  });
});
