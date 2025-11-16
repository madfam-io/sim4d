import { describe, it, expect } from 'vitest';
import { AdvancedDraftStepDraftNode } from './step-draft.node';
import { createTestContext } from '../test-utils';

describe('AdvancedDraftStepDraftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      draftData: undefined,
    } as any;
    const params = {
      steps: 2,
    } as any;

    const result = await AdvancedDraftStepDraftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
