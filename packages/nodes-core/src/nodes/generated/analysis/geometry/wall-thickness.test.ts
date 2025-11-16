import { describe, it, expect } from 'vitest';
import { WallThicknessNode } from './wallthickness.node';
import { createTestContext } from './../../test-utils';

describe('WallThicknessNode', () => {
  it('should create WallThickness', async () => {
    const context = createTestContext();
    const inputs = {
      solid: null,
    };
    const params = {
      minThickness: 1,
      maxThickness: 10,
    };

    const result = await WallThicknessNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.thinAreas).toBeDefined();
    expect(result.thickAreas).toBeDefined();
    expect(result.averageThickness).toBeDefined();
  });
});
