import { describe, it, expect } from 'vitest';
import { SheetMetalBendsSketchedBendNode } from './sketched-bend.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalBendsSketchedBendNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      bendLine: undefined,
    } as any;
    const params = {
      angle: 90,
      bendRadius: 3,
      bendDirection: 'up',
      bendAllowance: 0,
    } as any;

    const result = await SheetMetalBendsSketchedBendNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
