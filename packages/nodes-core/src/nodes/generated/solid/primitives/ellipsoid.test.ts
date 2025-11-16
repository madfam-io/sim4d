import { describe, it, expect } from 'vitest';
import { SolidPrimitivesEllipsoidNode } from './ellipsoid.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesEllipsoidNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radiusX: 50,
      radiusY: 40,
      radiusZ: 30,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
    } as any;

    const result = await SolidPrimitivesEllipsoidNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
