import { describe, it, expect } from 'vitest';
import { PatternsTilingWeavePatternNode } from './weave-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsTilingWeavePatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      weaveType: 'plain',
      warpCount: 10,
      weftCount: 10,
    } as any;

    const result = await PatternsTilingWeavePatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
