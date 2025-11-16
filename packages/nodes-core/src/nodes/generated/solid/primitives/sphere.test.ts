import { describe, it, expect } from 'vitest';
import { SolidPrimitivesSphereNode } from './sphere.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesSphereNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radius: 50,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      angle1: 0,
      angle2: 360,
      angle3: 180,
    } as any;

    const result = await SolidPrimitivesSphereNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
