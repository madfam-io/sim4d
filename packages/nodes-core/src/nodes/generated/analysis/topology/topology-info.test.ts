import { describe, it, expect } from 'vitest';
import { TopologyInfoNode } from './topologyinfo.node';
import { createTestContext } from './../../test-utils';

describe('TopologyInfoNode', () => {
  it('should create TopologyInfo', async () => {
    const context = createTestContext();
    const inputs = {
      shape: null,
    };
    const params = {};

    const result = await TopologyInfoNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.vertices).toBeDefined();
    expect(result.edges).toBeDefined();
    expect(result.faces).toBeDefined();
    expect(result.shells).toBeDefined();
    expect(result.solids).toBeDefined();
  });
});
