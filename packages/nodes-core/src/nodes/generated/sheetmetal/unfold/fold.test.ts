import { describe, it, expect } from 'vitest';
import { SheetMetalUnfoldFoldNode } from './fold.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalUnfoldFoldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      flatPattern: undefined,
      bendLines: undefined,
      bendAngles: undefined,
    } as any;
    const params = {
      foldSequence: 'auto',
      partialFold: 1,
    } as any;

    const result = await SheetMetalUnfoldFoldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
