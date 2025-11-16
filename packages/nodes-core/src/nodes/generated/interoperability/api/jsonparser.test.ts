import { describe, it, expect } from 'vitest';
import { InteroperabilityAPIJSONParserNode } from './jsonparser.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityAPIJSONParserNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      jsonData: undefined,
    } as any;
    const params = {
      path: '',
      flatten: false,
    } as any;

    const result = await InteroperabilityAPIJSONParserNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
