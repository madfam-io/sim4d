import { describe, it, expect } from 'vitest';
import { FieldGenerateChargeFieldNode } from './charge-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateChargeFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      charge: 1,
      falloff: 'inverse-square',
    } as any;

    const result = await FieldGenerateChargeFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
