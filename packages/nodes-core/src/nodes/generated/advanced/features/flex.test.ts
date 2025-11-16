import { describe, it, expect } from 'vitest';
import { AdvancedFeaturesFlexNode } from './flex.node';
import { createTestContext } from '../test-utils';

describe('AdvancedFeaturesFlexNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      bendPlane: undefined,
    } as any;
    const params = {
      bendAngle: 90,
      bendRadius: 10,
      accuracy: 1,
    } as any;

    const result = await AdvancedFeaturesFlexNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
