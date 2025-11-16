import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingRaftGenerationNode } from './raft-generation.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingRaftGenerationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      raftLayers: 3,
      raftOffset: 5,
    } as any;

    const result = await Fabrication3DPrintingRaftGenerationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
