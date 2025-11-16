import { describe, it, expect } from 'vitest';
import { DataTreeTreeFlattenNode } from './tree-flatten.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeFlattenNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {
      depth: 1,
    } as any;

    const result = await DataTreeTreeFlattenNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
