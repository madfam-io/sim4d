import { describe, it, expect } from 'vitest';
import { SpecializedTextText3DNode } from './text3-d.node';
import { createTestContext } from '../test-utils';

describe('SpecializedTextText3DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      text: 'HELLO',
      font: 'Arial',
      size: 20,
      height: 5,
      bold: false,
      italic: false,
    } as any;

    const result = await SpecializedTextText3DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
