import { describe, it, expect } from 'vitest';
import { AdvancedHealingCheckGeometryNode } from './check-geometry.node';
import { createTestContext } from '../test-utils';

describe('AdvancedHealingCheckGeometryNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      checkLevel: 'standard',
    } as any;

    const result = await AdvancedHealingCheckGeometryNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
