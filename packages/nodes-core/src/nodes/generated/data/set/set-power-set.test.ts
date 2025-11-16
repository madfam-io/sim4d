import { describe, it, expect } from 'vitest';
import { DataSetSetPowerSetNode } from './set-power-set.node';
import { createTestContext } from '../test-utils';

describe('DataSetSetPowerSetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      set: undefined,
    } as any;
    const params = {} as any;

    const result = await DataSetSetPowerSetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
