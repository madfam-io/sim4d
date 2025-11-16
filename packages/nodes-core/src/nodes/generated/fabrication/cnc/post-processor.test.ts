import { describe, it, expect } from 'vitest';
import { FabricationCNCPostProcessorNode } from './post-processor.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCPostProcessorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpaths: undefined,
    } as any;
    const params = {
      machine: 'haas',
      axes: '3-axis',
    } as any;

    const result = await FabricationCNCPostProcessorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
