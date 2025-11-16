import { describe, it, expect } from 'vitest';
import { DataConvertToBooleanNode } from './to-boolean.node';
import { createTestContext } from '../test-utils';

describe('DataConvertToBooleanNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertToBooleanNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
