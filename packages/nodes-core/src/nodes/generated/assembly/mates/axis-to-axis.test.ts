import { describe, it, expect } from 'vitest';
import { AssemblyMatesAxisToAxisNode } from './axis-to-axis.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesAxisToAxisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      axis1: undefined,
      axis2: undefined,
    } as any;
    const params = {
      colinear: true,
      offset: 0,
    } as any;

    const result = await AssemblyMatesAxisToAxisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
