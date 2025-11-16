import { describe, it, expect } from 'vitest';
import { BooleanIntersectionNode } from './intersection.node';
import { createTestContext } from '../test-utils';

describe('BooleanIntersectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      keepOriginals: false,
      fuzzyValue: 1e-7,
    } as any;

    const result = await BooleanIntersectionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
