import { describe, it, expect } from 'vitest';
import { DataStringStringReplaceNode } from './string-replace.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringReplaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
      search: undefined,
      replace: undefined,
    } as any;
    const params = {
      global: true,
    } as any;

    const result = await DataStringStringReplaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
