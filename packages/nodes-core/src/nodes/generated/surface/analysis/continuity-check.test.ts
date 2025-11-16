import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisContinuityCheckNode } from './continuity-check.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisContinuityCheckNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface1: undefined,
      surface2: undefined,
    } as any;
    const params = {
      checkType: 'G1',
      tolerance: 0.01,
    } as any;

    const result = await SurfaceAnalysisContinuityCheckNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
