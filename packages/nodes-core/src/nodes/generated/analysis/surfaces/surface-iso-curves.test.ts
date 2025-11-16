import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceIsoCurvesNode } from './surface-iso-curves.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceIsoCurvesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      uCount: 10,
      vCount: 10,
      direction: 'both',
    } as any;

    const result = await AnalysisSurfacesSurfaceIsoCurvesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
