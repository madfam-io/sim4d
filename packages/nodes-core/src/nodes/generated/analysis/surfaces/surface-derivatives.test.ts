import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceDerivativesNode } from './surface-derivatives.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceDerivativesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      u: 0.5,
      v: 0.5,
      order: 2,
      vectorScale: 1,
    } as any;

    const result = await AnalysisSurfacesSurfaceDerivativesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
