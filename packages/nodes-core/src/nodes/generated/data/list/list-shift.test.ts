import { describe, it, expect } from 'vitest';
import { DataListListShiftNode } from './list-shift.node';
import { createTestContext } from '../test-utils';

describe('DataListListShiftNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      list: undefined,
      offset: undefined,
    } as any;
    const params = {
      wrap: true,
    } as any;

    const result = await DataListListShiftNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
