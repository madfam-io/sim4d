import { describe, it, expect } from 'vitest';
import { DataStringStringSubstringNode } from './string-substring.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringSubstringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
      start: undefined,
    } as any;
    const params = {} as any;

    const result = await DataStringStringSubstringNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
