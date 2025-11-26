import { describe, it, expect } from 'vitest';
import { IOExchangeImportJSONNode } from './import-json.node';
import { createTestContext } from '../test-utils';

describe('IOExchangeImportJSONNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      jsonData: undefined,
    } as any;
    const params = {
      format: 'sim4d',
    } as any;

    const result = await IOExchangeImportJSONNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
