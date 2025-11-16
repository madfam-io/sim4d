import { describe, it, expect } from 'vitest';
import { SheetMetalPropertiesSheetMetalStyleNode } from './sheet-metal-style.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalPropertiesSheetMetalStyleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      thickness: 2,
      material: 'steel',
      kFactor: 0.44,
      minBendRadius: 2,
      reliefType: 'rectangular',
    } as any;

    const result = await SheetMetalPropertiesSheetMetalStyleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
