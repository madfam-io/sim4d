import { describe, it, expect } from 'vitest';
import { SpecializedTextEmbossNode } from './emboss.node';
import { createTestContext } from '../test-utils';

describe('SpecializedTextEmbossNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetFace: undefined,
      pattern: undefined,
    } as any;
    const params = {
      height: 1,
      angle: 45,
      roundEdges: true,
    } as any;

    const result = await SpecializedTextEmbossNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
