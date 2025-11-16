import { describe, it, expect } from 'vitest';
import { DataStringStringContainsNode } from './string-contains.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringContainsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
      search: undefined,
    } as any;
    const params = {
      caseSensitive: true,
    } as any;

    const result = await DataStringStringContainsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
