import { describe, it, expect } from 'vitest';
import { DataConvertToJSONNode } from './to-json.node';
import { createTestContext } from '../test-utils';

describe('DataConvertToJSONNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {
      pretty: false,
    } as any;

    const result = await DataConvertToJSONNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
