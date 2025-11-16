import { describe, it, expect } from 'vitest';
import { AssemblyPatternsInterferenceCheckNode } from './interference-check.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsInterferenceCheckNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
    } as any;
    const params = {
      clearance: 0,
    } as any;

    const result = await AssemblyPatternsInterferenceCheckNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
