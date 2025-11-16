import { describe, it, expect, vi } from 'vitest';
import { ProjectCurveNode } from './project-curve.node';
import { createTestContext } from './../../test-utils';

describe('ProjectCurveNode', () => {
  it('should create ProjectCurve', async () => {
    const context = createTestContext();
    const executeSpy = vi.fn().mockResolvedValue([{ id: 'projected-curve-1' }]);
    context.geometry.execute = executeSpy;

    const inputs = {
      curve: { id: 'curve-1' },
      surface: { id: 'surface-1' },
    } as any;
    const params = {
      projectionDirection: [0, 0, -1] as [number, number, number],
      projectBoth: false,
    } as any;

    const result = await ProjectCurveNode.evaluate(context as any, inputs, params);

    expect(executeSpy).toHaveBeenCalledWith({
      type: 'PROJECT_CURVE',
      params: {
        curve: inputs.curve,
        surface: inputs.surface,
        projectionDirection: [0, 0, -1],
        projectBoth: false,
      },
    });

    expect(result).toEqual({ projectedCurve: { id: 'projected-curve-1' } });
  });
});
