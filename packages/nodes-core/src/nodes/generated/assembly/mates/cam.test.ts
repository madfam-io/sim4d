import { describe, it, expect } from 'vitest';
import { AssemblyMatesCamNode } from './cam.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesCamNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cam: undefined,
      follower: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyMatesCamNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
