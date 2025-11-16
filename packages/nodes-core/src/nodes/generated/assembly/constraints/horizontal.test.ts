import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsHorizontalNode } from './horizontal.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsHorizontalNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyConstraintsHorizontalNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
