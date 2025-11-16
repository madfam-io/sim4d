import { describe, it, expect } from 'vitest';
import { DataStringStringLengthNode } from './string-length.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringLengthNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
    } as any;
    const params = {} as any;

    const result = await DataStringStringLengthNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
