import { describe, it, expect } from 'vitest';
import { DataListListFindNode } from './list-find.node';
import { createTestContext } from '../test-utils';

describe('DataListListFindNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      pattern: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListFindNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
