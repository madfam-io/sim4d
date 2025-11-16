import { describe, it, expect } from 'vitest';
import { ArchitectureWallsFoundationWallNode } from './foundation-wall.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsFoundationWallNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      foundationLine: undefined,
    } as any;
    const params = {
      depth: 1500,
      footingWidth: 600,
    } as any;

    const result = await ArchitectureWallsFoundationWallNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
