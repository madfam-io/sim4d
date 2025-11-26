import { describe, it, expect } from 'vitest';
import { IOExchangeExportJSONNode } from './export-json.node';
import { createTestContext } from '../test-utils';

describe('IOExchangeExportJSONNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      format: 'sim4d',
      precision: 6,
      includeTopology: true,
    } as any;

    const result = await IOExchangeExportJSONNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
