import { describe, it, expect } from 'vitest';
import { SolidPrimitivesTorusNode } from './torus.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesTorusNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      majorRadius: 50,
      minorRadius: 10,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      angle1: 0,
      angle2: 360,
      angle: 360,
    } as any;

    const result = await SolidPrimitivesTorusNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
