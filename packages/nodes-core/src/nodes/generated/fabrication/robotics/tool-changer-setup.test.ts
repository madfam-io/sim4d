import { describe, it, expect } from 'vitest';
import { FabricationRoboticsToolChangerSetupNode } from './tool-changer-setup.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsToolChangerSetupNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolRack: undefined,
    } as any;
    const params = {
      toolCount: 6,
    } as any;

    const result = await FabricationRoboticsToolChangerSetupNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
