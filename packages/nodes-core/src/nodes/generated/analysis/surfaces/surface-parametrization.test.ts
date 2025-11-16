import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceParametrizationNode } from './surface-parametrization.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceParametrizationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      showGrid: true,
      gridDensity: 20,
    } as any;

    const result = await AnalysisSurfacesSurfaceParametrizationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
