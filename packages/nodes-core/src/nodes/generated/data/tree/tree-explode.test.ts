import { describe, it, expect } from 'vitest';
import { DataTreeTreeExplodeNode } from './tree-explode.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeExplodeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeExplodeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
