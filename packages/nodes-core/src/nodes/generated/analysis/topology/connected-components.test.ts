import { describe, it, expect } from 'vitest';
import { ConnectedComponentsNode } from './connectedcomponents.node';
import { createTestContext } from './../../test-utils';

describe('ConnectedComponentsNode', () => {
  it('should create ConnectedComponents', async () => {
    const context = createTestContext();
    const inputs = {
      shape: null,
    };
    const params = {};

    const result = await ConnectedComponentsNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.components).toBeDefined();
    expect(result.count).toBeDefined();
  });
});
