import { describe, it, expect } from 'vitest';
import { DataConvertFromCSVNode } from './from-csv.node';
import { createTestContext } from '../test-utils';

describe('DataConvertFromCSVNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      csv: undefined,
    } as any;
    const params = {
      delimiter: ',',
      headers: true,
    } as any;

    const result = await DataConvertFromCSVNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
