import { describe, it, expect } from 'vitest';
import { FieldGenerateCylindricalFieldNode } from './cylindrical-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateCylindricalFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      axis: undefined,
    } as any;
    const params = {
      radius: 50,
      height: 100,
      falloff: 'smooth',
    } as any;

    const result = await FieldGenerateCylindricalFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
