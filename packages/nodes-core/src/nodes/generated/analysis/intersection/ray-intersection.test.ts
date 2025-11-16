import { describe, it, expect } from 'vitest';
import { AnalysisIntersectionRayIntersectionNode } from './ray-intersection.node';
import { createTestContext } from '../test-utils';

describe('AnalysisIntersectionRayIntersectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      rayOrigin: undefined,
      rayDirection: undefined,
      targets: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      maxDistance: 1000,
    } as any;

    const result = await AnalysisIntersectionRayIntersectionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
