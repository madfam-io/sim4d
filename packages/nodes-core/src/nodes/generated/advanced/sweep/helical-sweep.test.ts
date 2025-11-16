import { describe, it, expect } from 'vitest';
import { AdvancedSweepHelicalSweepNode } from './helical-sweep.node';
import { createTestContext } from '../test-utils';

describe('AdvancedSweepHelicalSweepNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      profile: undefined,
    } as any;
    const params = {
      pitch: 10,
      height: 100,
      turns: 5,
      radius: 20,
      leftHanded: false,
      taper: 0,
    } as any;

    const result = await AdvancedSweepHelicalSweepNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
