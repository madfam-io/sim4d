import { describe, it, expect } from 'vitest';
import { DataConvertTypeOfNode } from './type-of.node';
import { createTestContext } from '../test-utils';

describe('DataConvertTypeOfNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertTypeOfNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
