import { describe, it, expect } from 'vitest';
import { AdvancedFeaturesDomeNode } from './dome.node';
import { createTestContext } from '../test-utils';

describe('AdvancedFeaturesDomeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      face: undefined,
    } as any;
    const params = {
      height: 10,
      constraintType: 'tangent',
    } as any;

    const result = await AdvancedFeaturesDomeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
