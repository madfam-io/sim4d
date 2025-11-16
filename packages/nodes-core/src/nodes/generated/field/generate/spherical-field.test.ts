import { describe, it, expect } from 'vitest';
import { FieldGenerateSphericalFieldNode } from './spherical-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateSphericalFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      innerRadius: 10,
      outerRadius: 100,
      falloff: 'smooth',
    } as any;

    const result = await FieldGenerateSphericalFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
