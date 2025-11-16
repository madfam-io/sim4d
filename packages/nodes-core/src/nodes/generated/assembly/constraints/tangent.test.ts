import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsTangentNode } from './tangent.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsTangentNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity1: undefined,
      entity2: undefined,
    } as any;
    const params = {
      inside: false,
    } as any;

    const result = await AssemblyConstraintsTangentNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
