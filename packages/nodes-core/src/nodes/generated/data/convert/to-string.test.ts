import { describe, it, expect } from 'vitest';
import { DataConvertToStringNode } from './to-string.node';
import { createTestContext } from '../test-utils';

describe('DataConvertToStringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertToStringNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
