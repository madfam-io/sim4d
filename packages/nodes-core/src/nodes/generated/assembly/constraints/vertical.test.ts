import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsVerticalNode } from './vertical.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsVerticalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyConstraintsVerticalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
