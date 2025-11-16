import { describe, it, expect } from 'vitest';
import { AdvancedFeaturesDeformNode } from './deform.node';
import { createTestContext } from '../test-utils';

describe('AdvancedFeaturesDeformNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
      controlPoints: undefined,
      targetPoints: undefined,
    } as any;
    const params = {
      deformType: 'point',
      radius: 50,
      stiffness: 0.5,
    } as any;

    const result = await AdvancedFeaturesDeformNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
