import { describe, it, expect } from 'vitest';
import { PatternsIslamicMuqarnasNode } from './muqarnas.node';
import { createTestContext } from '../test-utils';

describe('PatternsIslamicMuqarnasNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      base: undefined,
    } as any;
    const params = {
      levels: 3,
      cellType: 'mixed',
    } as any;

    const result = await PatternsIslamicMuqarnasNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
