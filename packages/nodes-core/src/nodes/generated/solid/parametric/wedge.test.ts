import { describe, it, expect } from 'vitest';
import { SolidParametricWedgeNode } from './wedge.node';
import { createTestContext } from '../test-utils';

describe('SolidParametricWedgeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      dx: 100,
      dy: 50,
      dz: 75,
      xmax: 50,
      zmin: 25,
      zmax: 50,
    } as any;

    const result = await SolidParametricWedgeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
