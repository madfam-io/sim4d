import { describe, it, expect } from 'vitest';
import { DataStringStringFormatNode } from './string-format.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringFormatNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      template: undefined,
      values: undefined,
    } as any;
    const params = {} as any;

    const result = await DataStringStringFormatNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
