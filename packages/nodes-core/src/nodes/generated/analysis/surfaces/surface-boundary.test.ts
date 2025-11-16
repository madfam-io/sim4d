import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceBoundaryNode } from './surface-boundary.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceBoundaryNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      includeHoles: true,
      simplify: false,
    } as any;

    const result = await AnalysisSurfacesSurfaceBoundaryNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
