import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsFixedNode } from './fixed.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsFixedNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyConstraintsFixedNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
