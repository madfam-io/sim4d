import { describe, it, expect } from 'vitest';
import { DataTreeTreePathsNode } from './tree-paths.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreePathsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreePathsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
