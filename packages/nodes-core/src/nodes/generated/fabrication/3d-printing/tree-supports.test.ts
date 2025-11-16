import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingTreeSupportsNode } from './tree-supports.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingTreeSupportsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      branchAngle: 40,
      trunkDiameter: 5,
      branchDiameter: 2,
    } as any;

    const result = await Fabrication3DPrintingTreeSupportsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
