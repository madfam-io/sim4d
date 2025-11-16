import { describe, it, expect } from 'vitest';
import { BooleanImprintNode } from './imprint.node';
import { createTestContext } from '../test-utils';

describe('BooleanImprintNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      base: undefined,
      imprint: undefined,
    } as any;
    const params = {
      depth: 1,
    } as any;

    const result = await BooleanImprintNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
