import { describe, it, expect } from 'vitest';
import { DataTreeTreeGraftNode } from './tree-graft.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeGraftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeGraftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
