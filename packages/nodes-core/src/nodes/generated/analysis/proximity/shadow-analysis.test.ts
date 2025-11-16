import { describe, it, expect } from 'vitest';
import { AnalysisProximityShadowAnalysisNode } from './shadow-analysis.node';
import { createTestContext } from '../test-utils';

describe('AnalysisProximityShadowAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      lightSource: undefined,
      objects: undefined,
      groundPlane: undefined,
    } as any;
    const params = {
      lightType: 'directional',
      intensity: 1,
    } as any;

    const result = await AnalysisProximityShadowAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
