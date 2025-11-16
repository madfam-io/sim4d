import { describe, it, expect } from 'vitest';
import { AdvancedHealingRemoveFeaturesNode } from './remove-features.node';
import { createTestContext } from '../test-utils';

describe('AdvancedHealingRemoveFeaturesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      minSize: 0.5,
      removeHoles: true,
      removeFillets: false,
      removeChamfers: false,
    } as any;

    const result = await AdvancedHealingRemoveFeaturesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
