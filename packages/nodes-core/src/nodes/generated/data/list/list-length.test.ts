import { describe, it, expect } from 'vitest';
import { DataListListLengthNode } from './list-length.node';
import { createTestContext } from '../test-utils';

describe('DataListListLengthNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
    } as any;
    const params = {} as any;

    const result = await DataListListLengthNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
