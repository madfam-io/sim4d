import { describe, it, expect } from 'vitest';
import { SolidPrimitivesCapsuleNode } from './capsule.node';
import { createTestContext } from '../test-utils';

describe('SolidPrimitivesCapsuleNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radius: 25,
      height: 100,
    } as any;

    const result = await SolidPrimitivesCapsuleNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
