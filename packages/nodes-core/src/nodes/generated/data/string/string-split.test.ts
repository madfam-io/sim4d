import { describe, it, expect } from 'vitest';
import { DataStringStringSplitNode } from './string-split.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringSplitNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
    } as any;
    const params = {
      delimiter: ',',
    } as any;

    const result = await DataStringStringSplitNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
