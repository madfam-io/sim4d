import { describe, it, expect } from 'vitest';
import { DataListListFlattenNode } from './list-flatten.node';
import { createTestContext } from '../test-utils';

describe('DataListListFlattenNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {
      depth: 1,
    } as any;

    const result = await DataListListFlattenNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
