import { describe, it, expect } from 'vitest';
import { AdvancedDraftDraftNode } from './draft.node';
import { createTestContext } from '../test-utils';

describe('AdvancedDraftDraftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      facesToDraft: undefined,
    } as any;
    const params = {
      angle: 3,
      pullDirection: [0, 0, 1],
      neutralPlane: [0, 0, 0],
    } as any;

    const result = await AdvancedDraftDraftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
