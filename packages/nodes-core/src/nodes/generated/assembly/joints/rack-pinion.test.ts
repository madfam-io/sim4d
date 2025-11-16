import { describe, it, expect } from 'vitest';
import { AssemblyJointsRackPinionNode } from './rack-pinion.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsRackPinionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      rack: undefined,
      pinion: undefined,
    } as any;
    const params = {
      module: 1,
    } as any;

    const result = await AssemblyJointsRackPinionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
