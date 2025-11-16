import { describe, it, expect } from 'vitest';
import { SpecializedTextSerialNumberNode } from './serial-number.node';
import { createTestContext } from '../test-utils';

describe('SpecializedTextSerialNumberNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      count: undefined,
    } as any;
    const params = {
      prefix: 'SN',
      startNumber: 1,
      digits: 6,
      increment: 1,
    } as any;

    const result = await SpecializedTextSerialNumberNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
