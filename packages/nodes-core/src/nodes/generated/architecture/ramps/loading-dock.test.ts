import { describe, it, expect } from 'vitest';
import { ArchitectureRampsLoadingDockNode } from './loading-dock.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureRampsLoadingDockNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      dockPosition: undefined,
    } as any;
    const params = {
      dockHeight: 1200,
      levellerType: 'hydraulic',
    } as any;

    const result = await ArchitectureRampsLoadingDockNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
