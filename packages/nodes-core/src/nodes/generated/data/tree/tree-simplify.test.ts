import { describe, it, expect } from 'vitest';
import { DataTreeTreeSimplifyNode } from './tree-simplify.node';
import { createTestContext } from '../test-utils';

describe('DataTreeTreeSimplifyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      tree: undefined,
    } as any;
    const params = {} as any;

    const result = await DataTreeTreeSimplifyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
