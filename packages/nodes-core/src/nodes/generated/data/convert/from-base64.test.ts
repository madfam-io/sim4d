import { describe, it, expect } from 'vitest';
import { DataConvertFromBase64Node } from './from-base64.node';
import { createTestContext } from '../test-utils';

describe('DataConvertFromBase64Node', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      base64: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertFromBase64Node.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
