import { describe, it, expect } from 'vitest';
import { SolidHelicalHelixNode } from './helix.node';
import { createTestContext } from '../test-utils';

describe('SolidHelicalHelixNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radius: 50,
      pitch: 20,
      height: 100,
      leftHanded: false,
    } as any;

    const result = await SolidHelicalHelixNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
