import { describe, it, expect } from 'vitest';
import { VolumeNode } from './volume.node';
import { createTestContext } from './../../test-utils';

describe('VolumeNode', () => {
  it('should create Volume', async () => {
    const context = createTestContext();
    const inputs = {
      solid: null,
    };
    const params = {};

    const result = await VolumeNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.volume).toBeDefined();
  });
});
