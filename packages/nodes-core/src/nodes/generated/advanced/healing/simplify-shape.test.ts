import { describe, it, expect } from 'vitest';
import { AdvancedHealingSimplifyShapeNode } from './simplify-shape.node';
import { createTestContext } from '../test-utils';

describe('AdvancedHealingSimplifyShapeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      simplifyMethod: 'merge-faces',
      tolerance: 0.01,
      preserveTopology: true,
    } as any;

    const result = await AdvancedHealingSimplifyShapeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
