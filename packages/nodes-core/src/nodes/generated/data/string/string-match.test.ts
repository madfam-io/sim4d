import { describe, it, expect } from 'vitest';
import { DataStringStringMatchNode } from './string-match.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringMatchNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
      pattern: undefined,
    } as any;
    const params = {
      global: false,
    } as any;

    const result = await DataStringStringMatchNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
