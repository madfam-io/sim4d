import { describe, it, expect } from 'vitest';
import { SolidPrimitivesConeNode } from './cone.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesConeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radius1: 50,
      radius2: 0,
      height: 100,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      angle: 360,
    } as any;

    const result = await SolidPrimitivesConeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
