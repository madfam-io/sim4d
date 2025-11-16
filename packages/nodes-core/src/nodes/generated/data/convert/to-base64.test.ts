import { describe, it, expect } from 'vitest';
import { DataConvertToBase64Node } from './to-base64.node';
import { createTestContext } from '../test-utils';

describe('DataConvertToBase64Node', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {} as any;

    const result = await DataConvertToBase64Node.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
