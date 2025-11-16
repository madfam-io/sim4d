import { describe, it, expect } from 'vitest';
import { SheetMetalFeaturesLanceNode } from './lance.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFeaturesLanceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      sketch: undefined,
    } as any;
    const params = {
      lanceLength: 20,
      lanceWidth: 5,
      lanceHeight: 3,
      lanceAngle: 30,
    } as any;

    const result = await SheetMetalFeaturesLanceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
