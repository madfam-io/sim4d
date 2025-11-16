import { describe, it, expect } from 'vitest';
import { SpecializedOrganicReactionDiffusionNode } from './reaction-diffusion.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOrganicReactionDiffusionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      pattern: 'spots',
      scale: 10,
      iterations: 100,
    } as any;

    const result = await SpecializedOrganicReactionDiffusionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
