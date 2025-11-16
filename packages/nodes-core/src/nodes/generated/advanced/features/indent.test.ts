import { describe, it, expect } from 'vitest';
import { AdvancedFeaturesIndentNode } from './indent.node';
import { createTestContext } from '../test-utils';

describe('AdvancedFeaturesIndentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      targetBody: undefined,
      toolBody: undefined,
    } as any;
    const params = {
      offset: 0.5,
      flipDirection: false,
    } as any;

    const result = await AdvancedFeaturesIndentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
