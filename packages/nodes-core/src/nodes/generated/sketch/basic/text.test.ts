import { describe, it, expect } from 'vitest';
import { SketchBasicTextNode } from './text.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicTextNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      text: 'Text',
      font: 'Arial',
      size: 20,
      bold: false,
      italic: false,
      x: 0,
      y: 0,
    } as any;

    const result = await SketchBasicTextNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
