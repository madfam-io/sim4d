import { describe, it, expect } from 'vitest';
import { SheetMetalFeaturesBeadNode } from './bead.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFeaturesBeadNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      path: undefined,
    } as any;
    const params = {
      beadWidth: 10,
      beadHeight: 3,
      beadProfile: 'U',
    } as any;

    const result = await SheetMetalFeaturesBeadNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
