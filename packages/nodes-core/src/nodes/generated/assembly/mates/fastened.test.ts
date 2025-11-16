import { describe, it, expect } from 'vitest';
import { AssemblyMatesFastenedNode } from './fastened.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesFastenedNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      component1: undefined,
      component2: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyMatesFastenedNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
