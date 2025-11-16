import { describe, it, expect } from 'vitest';
import { SheetMetalFlangesEdgeFlangeNode } from './edge-flange.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFlangesEdgeFlangeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      edge: undefined,
    } as any;
    const params = {
      height: 25,
      angle: 90,
      bendRadius: 3,
      bendRelief: 'rectangular',
      reliefRatio: 0.5,
    } as any;

    const result = await SheetMetalFlangesEdgeFlangeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
