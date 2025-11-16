import { describe, it, expect } from 'vitest';
import { ArchitectureWallsMovablePartitionNode } from './movable-partition.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsMovablePartitionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      panelWidth: 1200,
      trackType: 'ceiling',
    } as any;

    const result = await ArchitectureWallsMovablePartitionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
