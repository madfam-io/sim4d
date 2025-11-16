import { describe, it, expect } from 'vitest';
import { BooleanCommonEdgesNode } from './common-edges.node';
import { createTestContext } from '../test-utils';

describe('BooleanCommonEdgesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape1: undefined,
      shape2: undefined,
    } as any;
    const params = {} as any;

    const result = await BooleanCommonEdgesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
