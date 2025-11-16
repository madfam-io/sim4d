import { describe, it, expect } from 'vitest';
import { SheetMetalCornersBendReliefNode } from './bend-relief.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalCornersBendReliefNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      bends: undefined,
    } as any;
    const params = {
      reliefType: 'rectangular',
      reliefDepth: 5,
      reliefWidth: 2,
    } as any;

    const result = await SheetMetalCornersBendReliefNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
