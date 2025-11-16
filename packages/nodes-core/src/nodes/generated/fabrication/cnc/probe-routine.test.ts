import { describe, it, expect } from 'vitest';
import { FabricationCNCProbeRoutineNode } from './probe-routine.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCProbeRoutineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      feature: undefined,
    } as any;
    const params = {
      probeType: 'corner',
    } as any;

    const result = await FabricationCNCProbeRoutineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
