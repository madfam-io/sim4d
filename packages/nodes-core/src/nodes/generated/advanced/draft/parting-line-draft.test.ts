import { describe, it, expect } from 'vitest';
import { AdvancedDraftPartingLineDraftNode } from './parting-line-draft.node';
import { createTestContext } from '../test-utils';

describe('AdvancedDraftPartingLineDraftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      partingEdges: undefined,
    } as any;
    const params = {
      upperAngle: 3,
      lowerAngle: 3,
      pullDirection: [0, 0, 1],
    } as any;

    const result = await AdvancedDraftPartingLineDraftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
