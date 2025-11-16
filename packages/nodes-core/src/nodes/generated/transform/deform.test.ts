import { describe, it, expect } from 'vitest';
import { TransformDeformNode } from './deform.node';
import { createTestContext } from '../test-utils';

describe('TransformDeformNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      method: 'bend',
      amount: 1,
    } as any;

    const result = await TransformDeformNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
