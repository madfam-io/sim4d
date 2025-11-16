import { describe, it, expect } from 'vitest';
import { SheetMetalUnfoldUnfoldNode } from './unfold.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalUnfoldUnfoldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      foldedShape: undefined,
    } as any;
    const params = {
      kFactor: 0.44,
      bendAllowance: 0,
      autoRelief: true,
    } as any;

    const result = await SheetMetalUnfoldUnfoldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
