import { describe, it, expect } from 'vitest';
import { SheetMetalFlangesMiterFlangeNode } from './miter-flange.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFlangesMiterFlangeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      edges: undefined,
    } as any;
    const params = {
      height: 25,
      angle: 90,
      miterAngle: 45,
      bendRadius: 3,
    } as any;

    const result = await SheetMetalFlangesMiterFlangeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
