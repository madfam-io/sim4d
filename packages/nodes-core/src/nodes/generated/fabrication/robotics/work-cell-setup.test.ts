import { describe, it, expect } from 'vitest';
import { FabricationRoboticsWorkCellSetupNode } from './work-cell-setup.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsWorkCellSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cellBoundary: undefined,
    } as any;
    const params = {
      robotCount: 1,
    } as any;

    const result = await FabricationRoboticsWorkCellSetupNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
