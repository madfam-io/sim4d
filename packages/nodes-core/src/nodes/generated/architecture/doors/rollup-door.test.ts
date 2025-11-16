import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsRollupDoorNode } from './rollup-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsRollupDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      slatHeight: 75,
      openHeight: 0,
    } as any;

    const result = await ArchitectureDoorsRollupDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
