import { describe, it, expect } from 'vitest';
import { AdvancedHealingDeleteFaceNode } from './delete-face.node';
import { createTestContext } from '../test-utils';

describe('AdvancedHealingDeleteFaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
      facesToDelete: undefined,
    } as any;
    const params = {
      healingType: 'extend',
    } as any;

    const result = await AdvancedHealingDeleteFaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
