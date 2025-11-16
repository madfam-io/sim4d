import { describe, it, expect } from 'vitest';
import { DataStringStringTrimNode } from './string-trim.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringTrimNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
    } as any;
    const params = {
      mode: 'both',
    } as any;

    const result = await DataStringStringTrimNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
