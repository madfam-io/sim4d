import { describe, it, expect } from 'vitest';
import { SheetMetalFlangesContourFlangeNode } from './contour-flange.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFlangesContourFlangeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      contour: undefined,
    } as any;
    const params = {
      angle: 90,
      bendRadius: 3,
      flangePosition: 'material-inside',
    } as any;

    const result = await SheetMetalFlangesContourFlangeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
