import { describe, it, expect } from 'vitest';
import { DataConvertToNumberNode } from './to-number.node';
import { createTestContext } from '../test-utils';

describe('DataConvertToNumberNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertToNumberNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
