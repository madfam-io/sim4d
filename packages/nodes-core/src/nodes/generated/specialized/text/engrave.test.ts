import { describe, it, expect } from 'vitest';
import { SpecializedTextEngraveNode } from './engrave.node';
import { createTestContext } from '../test-utils';

describe('SpecializedTextEngraveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetFace: undefined,
      pattern: undefined,
    } as any;
    const params = {
      depth: 1,
      angle: 45,
      roundCorners: true,
    } as any;

    const result = await SpecializedTextEngraveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
