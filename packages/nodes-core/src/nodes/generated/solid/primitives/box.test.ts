import { describe, it, expect } from 'vitest';
import { SolidPrimitivesBoxNode } from './box.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesBoxNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      width: 100,
      depth: 100,
      height: 100,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
    } as any;

    const result = await SolidPrimitivesBoxNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
