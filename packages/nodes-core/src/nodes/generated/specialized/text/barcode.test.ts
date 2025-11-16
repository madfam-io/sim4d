import { describe, it, expect } from 'vitest';
import { SpecializedTextBarcodeNode } from './barcode.node';
import { createTestContext } from '../test-utils';

describe('SpecializedTextBarcodeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      type: 'QR',
      data: '123456789',
      size: 20,
      height: 0.5,
    } as any;

    const result = await SpecializedTextBarcodeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
