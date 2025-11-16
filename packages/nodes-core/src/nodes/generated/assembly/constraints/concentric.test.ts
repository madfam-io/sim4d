import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsConcentricNode } from './concentric.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsConcentricNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity1: undefined,
      entity2: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyConstraintsConcentricNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
