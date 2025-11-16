import { describe, it, expect } from 'vitest';
import { AdvancedFeaturesWrapNode } from './wrap.node';
import { createTestContext } from '../test-utils';

describe('AdvancedFeaturesWrapNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetSurface: undefined,
      sketch: undefined,
    } as any;
    const params = {
      wrapType: 'emboss',
      depth: 1,
    } as any;

    const result = await AdvancedFeaturesWrapNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
