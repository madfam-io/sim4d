import { describe, it, expect } from 'vitest';
import { AnalysisIntersectionPlaneIntersectionNode } from './plane-intersection.node';
import { createTestContext } from '../test-utils';

describe('AnalysisIntersectionPlaneIntersectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
      plane: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
    } as any;

    const result = await AnalysisIntersectionPlaneIntersectionNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
