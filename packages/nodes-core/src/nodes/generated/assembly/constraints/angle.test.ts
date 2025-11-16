import { describe, it, expect } from 'vitest';
import { AssemblyConstraintsAngleNode } from './angle.node';
import { createTestContext } from '../test-utils';

describe('AssemblyConstraintsAngleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entity1: undefined,
      entity2: undefined,
    } as any;
    const params = {
      angle: 90,
    } as any;

    const result = await AssemblyConstraintsAngleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
