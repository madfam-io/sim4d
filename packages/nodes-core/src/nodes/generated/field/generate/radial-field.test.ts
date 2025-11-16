import { describe, it, expect } from 'vitest';
import { FieldGenerateRadialFieldNode } from './radial-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateRadialFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      center: undefined,
    } as any;
    const params = {
      falloff: 'linear',
      radius: 100,
      strength: 1,
    } as any;

    const result = await FieldGenerateRadialFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
