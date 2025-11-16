import { describe, it, expect } from 'vitest';
import { FeaturesStructuralLinearRibNode } from './linear-rib.node';
import { createTestContext } from '../test-utils';

describe('FeaturesStructuralLinearRibNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      face: undefined,
      path: undefined,
    } as any;
    const params = {
      thickness: 3,
      height: 20,
      draftAngle: 1,
      topRadius: 1,
    } as any;

    const result = await FeaturesStructuralLinearRibNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
