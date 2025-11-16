import { describe, it, expect } from 'vitest';
import { DataStringStringConcatNode } from './string-concat.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringConcatNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      strings: undefined,
    } as any;
    const params = {
      separator: '',
    } as any;

    const result = await DataStringStringConcatNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
