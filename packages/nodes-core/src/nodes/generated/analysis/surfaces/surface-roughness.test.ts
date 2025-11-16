import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceRoughnessNode } from './surface-roughness.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceRoughnessNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      sampleDensity: 50,
      analysisType: 'all',
    } as any;

    const result = await AnalysisSurfacesSurfaceRoughnessNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
