import { describe, it, expect } from 'vitest';
import { BooleanGlueNode } from './glue.node';
import { createTestContext } from '../test-utils';

describe('BooleanGlueNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      tolerance: 1e-7,
    } as any;

    const result = await BooleanGlueNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
