import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceAreaNode } from './surface-area.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceAreaNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      precision: 0.01,
      showCentroid: true,
    } as any;

    const result = await AnalysisSurfacesSurfaceAreaNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
