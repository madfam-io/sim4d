import { describe, it, expect } from 'vitest';
import { PatternsIslamicArabesqueNode } from './arabesque.node';
import { createTestContext } from '../test-utils';

describe('PatternsIslamicArabesqueNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      complexity: 3,
      symmetry: 6,
    } as any;

    const result = await PatternsIslamicArabesqueNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
