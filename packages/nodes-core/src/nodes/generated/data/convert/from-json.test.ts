import { describe, it, expect } from 'vitest';
import { DataConvertFromJSONNode } from './from-json.node';
import { createTestContext } from '../test-utils';

describe('DataConvertFromJSONNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      json: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertFromJSONNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
