import { describe, it, expect } from 'vitest';
import { FabricationCNCRampEntryNode } from './ramp-entry.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCRampEntryNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      entryEdge: undefined,
      depth: undefined,
    } as any;
    const params = {
      rampAngle: 5,
      rampLength: 20,
    } as any;

    const result = await FabricationCNCRampEntryNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
